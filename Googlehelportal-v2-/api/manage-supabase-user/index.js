import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, name, tier } = req.body;

  if (!action || !email) {
    return res.status(400).json({ error: 'Action and Email are required' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Supabase Admin] Configuration missing');
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  // Create admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log(`[Supabase Admin] Action: ${action} for ${email}`);

  try {
    if (action === 'add') {
      // 1. Check if user already exists
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const existingUser = users.find(u => u.email === email);

      if (existingUser) {
        console.log(`[Supabase Admin] User ${email} already exists in Auth.`);
        return res.status(200).json({ message: 'User already exists', user: existingUser });
      }

      // 2. Invite user (creates them in auth.users and sends invitation)
      // Note: We use inviteUserByEmail which works with shouldCreateUser: false 
      // because it's a server-side administrative action.
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name, tier: tier },
        redirectTo: process.env.SITE_URL || undefined
      });

      if (inviteError) throw inviteError;

      console.log(`[Supabase Admin] Invited user: ${email}`);
      return res.status(200).json({ message: 'User invited successfully', data: inviteData });

    } else if (action === 'delete') {
      // 1. Find user by email
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const targetUser = users.find(u => u.email === email);

      if (!targetUser) {
        console.log(`[Supabase Admin] User ${email} not found in Auth. Skipping delete.`);
        return res.status(200).json({ message: 'User not found in Auth' });
      }

      // 2. Delete user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
      if (deleteError) throw deleteError;

      console.log(`[Supabase Admin] Deleted user: ${email}`);
      return res.status(200).json({ message: 'User deleted successfully' });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(`[Supabase Admin] Error during ${action}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
