import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los enlaces de email de Supabase (magic link, confirmación
 * de cuenta y recuperación de contraseña). Verifica el token y redirige:
 * al jardín por defecto, o a `next` (ej. /reset-password para recovery).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  // Solo rutas internas, para evitar redirecciones abiertas.
  const destination = next && next.startsWith("/") ? next : "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=enlace-invalido", request.url)
  );
}
