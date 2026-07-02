import type { GrowthStage } from "./types";

/** Fecha local (no UTC) en formato "YYYY-MM-DD". */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function fmtDateLabel(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Días consecutivos terminando hoy (o ayer, si hoy aún no se marcó). */
export function computeStreak(log: string[]): number {
  if (log.length === 0) return 0;
  const dates = new Set(log);
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(toDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function growthStage(streak: number): GrowthStage {
  if (streak <= 0) return "seed";
  if (streak < 3) return "sprout";
  if (streak < 7) return "sapling";
  if (streak < 21) return "bush";
  return "bloom";
}

/** % de días cumplidos del mes actual, contando solo los días ya transcurridos. */
export function monthCompletion(log: string[]): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysPassed = now.getDate();
  const doneSet = new Set(log);
  let count = 0;
  for (let day = 1; day <= daysPassed; day++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (doneSet.has(ds)) count++;
  }
  return Math.round((count / daysPassed) * 100);
}
