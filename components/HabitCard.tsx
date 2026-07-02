"use client";

import { useRef, useState } from "react";
import GrowthIcon from "./GrowthIcon";
import Heatmap from "./Heatmap";
import {
  computeStreak,
  growthStage,
  monthCompletion,
  todayStr,
} from "@/lib/dates";
import type { HabitWithLog } from "@/lib/types";

interface Props {
  habit: HabitWithLog;
  onToggle: (habit: HabitWithLog) => Promise<void>;
  onEdit: (habit: HabitWithLog) => void;
  onDelete: (habit: HabitWithLog) => Promise<void>;
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete }: Props) {
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const streak = computeStreak(habit.log);
  const stage = growthStage(streak);
  const doneToday = habit.log.includes(todayStr());
  const pct = monthCompletion(habit.log);
  const reminder = habit.reminder_time ? habit.reminder_time.slice(0, 5) : null;

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (!doneToday) {
        setPop(true);
        if (popTimer.current) clearTimeout(popTimer.current);
        popTimer.current = setTimeout(() => setPop(false), 350);
      }
      await onToggle(habit);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (
      window.confirm(
        `¿Eliminar "${habit.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      await onDelete(habit);
    }
  }

  return (
    <div className="plot">
      <div className="plot-top">
        <h3 className="plot-name">{habit.name}</h3>
        <div
          className="plot-icon-wrap"
          style={{ background: `${habit.color}22`, color: habit.color }}
        >
          <GrowthIcon stage={stage} />
        </div>
      </div>
      <div className="streak-row">
        🔥 <span className="streak-num">{streak}</span> día
        {streak === 1 ? "" : "s"} seguidos
      </div>
      {reminder && <div className="reminder-tag">⏰ recordatorio {reminder}</div>}
      <div className="plot-actions">
        <button
          className={`btn-water ${doneToday ? "done" : ""} ${pop ? "pop" : ""}`}
          onClick={handleToggle}
          disabled={busy}
        >
          {doneToday ? "✓ Hecho hoy" : "Marcar hoy"}
        </button>
        <button
          className="icon-btn"
          onClick={() => onEdit(habit)}
          title="Editar"
          aria-label={`Editar hábito ${habit.name}`}
        >
          ✎
        </button>
        <button
          className="icon-btn"
          onClick={handleDelete}
          title="Eliminar"
          aria-label={`Eliminar hábito ${habit.name}`}
        >
          🗑
        </button>
      </div>
      <details className="bed">
        <summary>Ver este mes</summary>
        <Heatmap habit={habit} />
        <div className="stats-row">
          <span>{pct}% cumplido este mes</span>
        </div>
      </details>
    </div>
  );
}
