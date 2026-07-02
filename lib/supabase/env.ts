/**
 * Lee y valida las variables de entorno de Supabase, con un mensaje de
 * error claro si faltan, y tolerancia a errores comunes al copiarlas
 * (por ejemplo, pegar la URL con el sufijo /rest/v1/).
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase " +
        "(NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
        "En desarrollo local: copia .env.example a .env.local y pega los valores " +
        "desde el dashboard de Supabase (Project Settings → Data API), " +
        "y reinicia `npm run dev`. En Vercel: agrégalas en Settings → " +
        "Environment Variables y haz Redeploy. Ver docs/SETUP.md."
    );
  }

  // Normalizar: sin barra final y sin sufijos de API que no van aquí.
  const url = rawUrl.replace(/\/(rest|auth)\/v1\/?$/, "").replace(/\/+$/, "");

  return { url, anonKey };
}
