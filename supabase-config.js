const SUPABASE_URL = 'https://lkhmpkfuxiitctmgnrdg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Tf2TEVFMyWTpAfpQJaSP2g_q5x8swM0';

const { createClient } = window.supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
