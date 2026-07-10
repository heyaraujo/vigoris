/*
  Use a URL do projeto e a Publishable Key.
  Nunca coloque a secret key ou service_role aqui.
*/

window.VIGORIS_SUPABASE_URL =
  'https://cncztfdxultyqirqbikp.supabase.co';

window.VIGORIS_SUPABASE_KEY =
  'sb_publishable__f7FoxnWEFmY54rpY7qH2g_F4uYA6d1';

const vigorisConfigReady =
  !window.VIGORIS_SUPABASE_URL.includes('COLE_AQUI') &&
  !window.VIGORIS_SUPABASE_KEY.includes('COLE_AQUI');

window.vigorisSupabase = vigorisConfigReady
  ? window.supabase.createClient(
      window.VIGORIS_SUPABASE_URL,
      window.VIGORIS_SUPABASE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    )
  : null;