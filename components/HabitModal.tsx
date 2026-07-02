"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS } from "@/lib/colors";
import type { HabitInput } from "@/lib/habits";
import type { HabitWithLog } from "@/lib/types";

interface Props {
  habit: HabitWithLog | null;
  onSave: (input: HabitInput) => Promise<void>;
  onClose: () => void;
}

export default function HabitModal({ habit, onSave, onClose }: Props) {
  const [name, setName] = useState(habit?.name ?? "");
  const [color, setColor] = useState(habit?.color ?? COLORS[0].hex);
  const [time, setTime] = useState(habit?.reminder_time?.slice(0, 5) ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ponle un nombre a tu hábito.");
      nameRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: trimmed, color, reminder_time: time || null });
    } catch {
      setError("No se pudo guardar. Revisa tu conexión e intenta de nuevo.");
      setSaving(false);
    }
  }

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <h2 id="modalTitle">
          {habit ? "Editar hábito" : "Plantar un hábito nuevo"}
        </h2>
        <div className="field">
          <label htmlFor="habitName">Nombre del hábito</label>
          <input
            ref={nameRef}
            type="text"
            id="habitName"
            placeholder="Ej. Leer 10 páginas"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label id="colorLabel">Color</label>
          <div className="swatches" role="radiogroup" aria-labelledby="colorLabel">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                role="radio"
                aria-checked={color === c.hex}
                aria-label={`Color ${c.name}`}
                className={`swatch ${color === c.hex ? "selected" : ""}`}
                style={{ background: c.hex }}
                onClick={() => setColor(c.hex)}
              />
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="habitTime">Recordatorio (opcional)</label>
          <input
            type="time"
            id="habitTime"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        {error && (
          <p className="auth-msg error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : habit ? "Guardar" : "Plantar"}
          </button>
        </div>
      </div>
    </div>
  );
}
