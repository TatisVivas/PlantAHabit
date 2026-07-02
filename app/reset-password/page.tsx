import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Nueva contraseña — Mi Jardín de Hábitos",
};

export default async function ResetPasswordPage() {
  // Solo accesible con la sesión que crea el enlace de recuperación.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="auth-wrap">
      <p className="eyebrow">Tu jardín personal</p>
      <h1>Nueva contraseña</h1>
      <ResetPasswordForm />
    </div>
  );
}
