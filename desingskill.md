---
name: desingskill
description: ## Source of truth

The visual design lives in these files from the old project:

- pages/shared.css → all CSS variables, copy verbatim
- pages/login.html → login page markup + styles
- pages/user.html → member profile markup + styles
- pages/hq-control-7x9k.html → admin panel markup + styles

## Rules for AI agent

- DO NOT redesign anything. Replicate markup and styles exactly.
- Copy the CSS variable system from shared.css into globals.css
- Keep all class names identical (.login-card, .otp-group, .stat-card etc.)
- Keep dark mode as default, light mode via html.light class + localStorage
- Keep fonts: Inter (UI) + JetBrains Mono (monospace elements)
- Keep animations: slideUp, spin (copy keyframes verbatim)
- Replace <script> logic only — keep all HTML structure and CSS

## Component mapping (old HTML → new React component)

pages/login.html          → app/(auth)/login/page.tsx
.login-card             → <LoginCard />
.otp-group inputs       → <OtpInput /> (6 boxes)
.countdown-row          → <Countdown />
.theme-toggle button    → <ThemeToggle />

pages/user.html           → app/(portal)/dashboard/page.tsx
.profile-card           → <ProfileCard />
.profile-cover          → <ProfileCover />
.locked-grid cards      → <FeatureCard />
.portal-header          → <Header />
.action-menu dropdown   → <ActionMenu />

pages/hq-control-7x9k.html → app/(admin)/admin/page.tsx
.stats-row              → <StatsRow />
.table-card + table     → <MembersTable />
.modal-overlay          → <MemberModal />
.confirm-modal          → <DeleteConfirmModal />

## CSS approach

Option A (recommended): Copy styles into each component as a <style> tag
or a co-located .module.css file — zero refactoring needed.
Option B: Convert to Tailwind — only do this if user asks, it takes longer.

## Do not change

- Border radius values
- Box shadow values
- Color values (use exact hex/rgba from shared.css)
- Font sizes and weights
- Animation timing (cubic-bezier values)
- Mobile breakpoints (480px, 360px, 768px)
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Define the functionality provided by this skill, including detailed instructions and examples