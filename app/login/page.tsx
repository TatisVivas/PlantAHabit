import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Entrar — Mi Jardín de Hábitos",
};

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <p className="eyebrow">Tu jardín personal</p>
      <h1>Mi Jardín de Hábitos</h1>
      <LoginForm />
    </div>
  );
}
