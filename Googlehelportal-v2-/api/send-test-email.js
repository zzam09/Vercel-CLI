import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { templateId, email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  const { data: template, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error || !template) return res.status(404).json({ error: 'Template not found' });

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px;border-radius:12px;">
      <h1 style="font-size:20px;text-transform:uppercase;letter-spacing:2px;">${template.subject.replace('{name}', name || 'User')}</h1>
      <p>${template.message.replace('{name}', name || 'User')}</p>
      ${template.button_text && template.button_url ? `
        <a href="${template.button_url}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#fff;color:#000;text-decoration:none;font-weight:700;border-radius:8px;text-transform:uppercase;letter-spacing:1px;">
          ${template.button_text}
        </a>` : ''}
      <p style="color:#a1a1aa;font-size:12px;margin-top:40px;">This is a test email.</p>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'SpaceX Operations <noreply@spacexhqvip.com>',
      to: [email],
      subject: `[TEST] ${template.subject.replace('{name}', name || 'User')}`,
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json(data);
  return res.status(200).json(data);
}
