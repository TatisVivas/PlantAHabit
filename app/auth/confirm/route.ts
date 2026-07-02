import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los enlaces de email de Supabase (magic link, confirmación
 * de cuenta y recuperación de contraseña).
 *
 * Soporta los dos formatos de enlace:
 *  - `?code=...`: el de las plantillas por defecto de Supabase (flujo PKCE).
 *    El enlace del correo pasa por el endpoint /verify de Supabase, que
 *    redirige aquí con un código para canjear por una sesión.
 *  - `?token_hash=...&type=...`: el de plantillas personalizadas que apuntan
 *    directo a esta ruta (requiere SMTP propio para editar las plantillas).
 *
 * Tras verificar, redirige al jardín o a `next` (ej. /reset-password).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  // Solo rutas internas, para evitar redirecciones abiertas.
  const destination = next && next.startsWith("/") ? next : "/";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=enlace-invalido", request.url)
  );
}
