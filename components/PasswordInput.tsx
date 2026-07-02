"use client";

import { useState } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength = 6,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw-wrap">
        <input
          type={visible ? "text" : "password"}
          id={id}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="eye-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <EyeIcon off={visible} />
        </button>
      </div>
    </div>
  );
}
