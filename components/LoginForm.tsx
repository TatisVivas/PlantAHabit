"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type Msg = { kind: "error" | "ok"; text: string } | null;

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setMsg(null);
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (mode === "signup" && password !== confirmPassword) {
      setMsg({ kind: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setBusy(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMsg({
          kind: "error",
          text:
            error.message === "Invalid login credentials"
              ? "Email o contraseña incorrectos."
              : error.message,
        });
        setBusy(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) {
        setMsg({ kind: "error", text: error.message });
        setBusy(false);
        return;
      }
      if (data.session) {
        // Confirmación de email desactivada en el proyecto: sesión directa.
        router.push("/");
        router.refresh();
        return;
      }
      setMsg({
        kind: "ok",
        text: "Cuenta creada. Revisa tu correo y haz clic en el enlace de confirmación para entrar.",
      });
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setMsg({ kind: "error", text: "Escribe tu email primero." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setBusy(false);
    if (error) {
      setMsg({ kind: "error", text: error.message });
      return;
    }
    setMsg({
      kind: "ok",
      text: "Te enviamos un enlace mágico. Ábrelo desde este dispositivo para entrar sin contraseña.",
    });
  }

  async function handleForgotPassword() {
    if (!email) {
      setMsg({
        kind: "error",
        text: "Escribe tu email arriba y vuelve a hacer clic en «¿Olvidaste tu contraseña?».",
      });
      return;
    }
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      setMsg({ kind: "error", text: error.message });
      return;
    }
    setMsg({
      kind: "ok",
      text: "Te enviamos un correo para restablecer tu contraseña. Ábrelo y sigue el enlace.",
    });
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist" aria-label="Modo de acceso">
        <button
          role="tab"
          aria-selected={mode === "signin"}
          className={`auth-tab ${mode === "signin" ? "active" : ""}`}
          onClick={() => switchMode("signin")}
        >
          Entrar
        </button>
        <button
          role="tab"
          aria-selected={mode === "signup"}
          className={`auth-tab ${mode === "signup" ? "active" : ""}`}
          onClick={() => switchMode("signup")}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <PasswordInput
          id="password"
          label="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />

        {mode === "signup" && (
          <PasswordInput
            id="confirmPassword"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={busy}
          style={{ width: "100%" }}
        >
          {busy
            ? "Un momento…"
            : mode === "signin"
              ? "Entrar al jardín"
              : "Plantar mi cuenta"}
        </button>
      </form>

      {msg && (
        <p className={`auth-msg ${msg.kind}`} role="alert">
          {msg.text}
        </p>
      )}

      {mode === "signin" && (
        <div className="auth-alt">
          <button type="button" onClick={handleForgotPassword} disabled={busy}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      <div className="auth-alt">
        <button type="button" onClick={handleMagicLink} disabled={busy}>
          o recibir un enlace mágico por email (sin contraseña)
        </button>
      </div>
    </div>
  );
}
