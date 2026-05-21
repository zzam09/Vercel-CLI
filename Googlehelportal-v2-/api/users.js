import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const cleaned = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.email.split('@')[0],
      tier: u.user_metadata?.tier || null,
      joined: u.created_at,
    }));

    return res.status(200).json(cleaned);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
