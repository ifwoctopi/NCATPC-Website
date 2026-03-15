const requiredVariables = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

export function getEnv() {
  const missing = requiredVariables.filter((variableName) => !import.meta.env[variableName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}. Add them to your .env file.`
    );
  }

  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}
