import { createClient } from "./supabase/server";
import { attachLogs } from "./habits";
import type { Habit, HabitLog, HabitWithLog } from "./types";

/** Versión servidor de getHabits(), para el primer render (SSR). */
export async function getHabitsServer(): Promise<HabitWithLog[]> {
  const supabase = await createClient();

  const [habitsRes, logsRes] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("habit_id, log_date")
      .order("log_date", { ascending: true }),
  ]);

  if (habitsRes.error) throw habitsRes.error;
  if (logsRes.error) throw logsRes.error;

  return attachLogs(
    habitsRes.data as Habit[],
    logsRes.data as Pick<HabitLog, "habit_id" | "log_date">[]
  );
}
