"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(
        updateError.message === "New password should be different from the old password."
          ? "La nueva contraseña debe ser distinta a la anterior."
          : updateError.message
      );
      setBusy(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.5 }}>
        Elige una contraseña nueva para tu cuenta. Al guardarla entrarás
        directo a tu jardín.
      </p>
      <form onSubmit={handleSubmit}>
        <PasswordInput
          id="newPassword"
          label="Nueva contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordInput
          id="confirmNewPassword"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={busy}
          style={{ width: "100%" }}
        >
          {busy ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
      {error && (
        <p className="auth-msg error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
