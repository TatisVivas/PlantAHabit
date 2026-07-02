import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Entrar — Mi Jardín de Hábitos",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="auth-wrap">
      <p className="eyebrow">Tu jardín personal</p>
      <h1>Mi Jardín de Hábitos</h1>
      {error === "enlace-invalido" && (
        <p className="auth-msg error" role="alert">
          El enlace del correo no es válido o ya expiró. Vuelve a intentarlo
          iniciando sesión o pidiendo un enlace nuevo.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
