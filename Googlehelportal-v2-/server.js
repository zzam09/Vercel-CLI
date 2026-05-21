
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc, limit, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { render } from '@react-email/render';
import React from 'react';
import { WelcomeEmail } from './emails/welcome.jsx';
import { ResetPasswordEmail } from './emails/reset-password.jsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Config
const firebaseConfig = {
    apiKey:            process.env.VITE_FIREBASE_API_KEY,
    authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.VITE_FIREBASE_APP_ID,
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load welcome template helper
async function sendWelcomeEmail(name, email, docId) {
    console.log(`[Email Service] Attempting to send welcome email to ${email}`);
    try {
        const templateDoc = await getDoc(doc(db, 'emailTemplates', 'welcome'));
        
        if (!templateDoc.exists()) {
            console.error('[Email Service] Welcome template not found in Firestore');
            return;
        }

        const template = templateDoc.data();

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) {
            console.error('[Email Service] RESEND_API_KEY missing');
            return;
        }

        const html = await render(React.createElement(WelcomeEmail, { 
            name,
            subject: template.subject,
            message: template.message,
            buttonText: template.buttonText,
            buttonUrl: template.buttonUrl
        }));

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'SpaceX Operations <onboarding@resend.dev>',
                to: [email],
                subject: template.subject.replace('{name}', name),
                html: html,
            }),
        });

        if (response.ok) {
            console.log(`[Email Service] Email sent successfully to ${email}`);
            await updateDoc(doc(db, 'members', docId), { welcomeEmailSent: true });
        } else {
            const err = await response.json();
            console.error('[Email Service] Resend error:', err);
        }
    } catch (error) {
        console.error('[Email Service] Error:', error);
    }
}

// Watch for new members in Firestore
console.log('[Firestore Service] Starting member watch...');
const membersCol = collection(db, 'members');
// We listen for any member where welcomeEmailSent is false or missing
// Note: onSnapshot will trigger for existing docs too, so we'll catch anyone who hasn't been emailed yet.
onSnapshot(membersCol, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
            const m = change.doc.data();
            if (m.email && !m.welcomeEmailSent && m.status === 'ACTIVE') {
                 sendWelcomeEmail(m.name, m.email, change.doc.id);
            }
        }
    });
});

// API Route: Send Welcome Email Manual Trigger
app.post('/api/send-welcome-email', async (req, res) => {
    try {
        const handlerPath = path.join(__dirname, 'api', 'send-welcome-email', 'index.js');
        if (fs.existsSync(handlerPath)) {
            const { default: handler } = await import(`file://${handlerPath}`);
            return handler(req, res);
        } else {
            return res.status(404).json({ error: 'API handler not found' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API Routes: Template Management
app.get('/api/templates', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'emailTemplates'));
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: 'Error reading templates from Firestore' });
    }
});

app.post('/api/templates', async (req, res) => {
    try {
        const templates = req.body;
        for (const template of templates) {
            const { id, ...data } = template;
            await setDoc(doc(db, 'emailTemplates', id), data);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error saving templates to Firestore' });
    }
});

app.get('/api/templates/seed', async (req, res) => {
    try {
        const seedData = [
            {
                "id": "welcome",
                "name": "Welcome Email",
                "subject": "Welcome to the Fleet",
                "message": "Access granted. Your [SpaceX/Tesla] Member Portal is now online. Use it to schedule your next private meeting, find local meetups, or access exclusive member documents and more.",
                "buttonText": "ACCESS PORTAL",
                "buttonUrl": "https://spacexmembership-5cdc3.firebaseapp.com/pages/login.html"
            },
            {
                "id": "reset-password",
                "name": "Password Reset",
                "subject": "Password Reset Request",
                "message": "We received a request to reset your password for your SpaceX HQ account. If you didn't make this request, you can safely ignore this email.",
                "buttonText": "RESET PASSWORD",
                "buttonUrl": "https://spacexmembership-5cdc3.firebaseapp.com/pages/login.html#reset"
            }
        ];

        for (const template of seedData) {
            const { id, ...data } = template;
            await setDoc(doc(db, 'emailTemplates', id), data);
        }
        res.json({ success: true, message: 'Firestore seeded with templates' });
    } catch (error) {
        res.status(500).json({ error: 'Error seeding templates: ' + error.message });
    }
});

app.post('/api/send-test-email', async (req, res) => {
    const { templateId, email, name } = req.body;
    try {
        const templateDoc = await getDoc(doc(db, 'emailTemplates', templateId));
        if (!templateDoc.exists()) return res.status(404).json({ error: 'Template not found' });
        const template = templateDoc.data();

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const Component = templateId === 'welcome' ? WelcomeEmail : ResetPasswordEmail;
        
        const html = await render(React.createElement(Component, { 
            name: name || 'Test User',
            subject: template.subject,
            message: template.message,
            buttonText: template.buttonText,
            buttonUrl: template.buttonUrl
        }));

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'SpaceX Operations <onboarding@resend.dev>',
                to: [email],
                subject: `[TEST] ${template.subject}`,
                html: html,
            }),
        });

        if (response.ok) {
            res.json({ success: true });
        } else {
            const err = await response.json();
            res.status(500).json(err);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Route: Manage Supabase User (Admin Auth)
app.post('/api/manage-supabase-user', async (req, res) => {
    try {
        const handlerPath = path.join(__dirname, 'api', 'manage-supabase-user', 'index.js');
        if (fs.existsSync(handlerPath)) {
            const { default: handler } = await import(`file://${handlerPath}`);
            return handler(req, res);
        } else {
            return res.status(404).json({ error: 'API handler not found' });
        }
    } catch (error) {
        console.error('API Error Manage Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// For development: Proxy or serve static
// In this platform, we usually run the dev server or serve build.
// If we are in "dev" mode, we might want to leverage Vite's middleware.
// But for the sake of working "out of the box" in both:

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
} else {
    // In dev, usually Vite runs on 3000. 
    // If we want both, we can use vite as middleware.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use(async (req, res, next) => {
        const url = req.originalUrl;
        try {
            // Resolve which HTML file to serve for multi-page app
            const urlPath = url.split('?')[0].split('#')[0];
            let htmlFile = 'index.html';

            // Try exact .html match first, then append .html, then index.html fallback
            const candidates = [
                urlPath.replace(/^\//, ''),
                urlPath.replace(/^\//, '') + '.html',
                urlPath.replace(/^\//, '').replace(/\/$/, '') + '/index.html',
            ];
            for (const candidate of candidates) {
                if (candidate.endsWith('.html')) {
                    const full = path.resolve(__dirname, candidate);
                    if (fs.existsSync(full)) { htmlFile = candidate; break; }
                }
            }

            let template = fs.readFileSync(path.resolve(__dirname, htmlFile), 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
