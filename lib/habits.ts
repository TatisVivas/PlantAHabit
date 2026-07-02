import { createClient } from "./supabase/client";
import { todayStr } from "./dates";
import type { Habit, HabitLog, HabitWithLog } from "./types";

export interface HabitInput {
  name: string;
  color: string;
  reminder_time: string | null;
}

/**
 * Capa de acceso a datos: la UI solo debe hablar con este módulo,
 * nunca con Supabase directamente.
 */

/** Une hábitos con sus fechas marcadas (función pura, compartida con el servidor). */
export function attachLogs(
  habits: Habit[],
  logs: Pick<HabitLog, "habit_id" | "log_date">[]
): HabitWithLog[] {
  const logsByHabit = new Map<string, string[]>();
  for (const row of logs) {
    const list = logsByHabit.get(row.habit_id) ?? [];
    list.push(row.log_date);
    logsByHabit.set(row.habit_id, list);
  }
  return habits.map((habit) => ({
    ...habit,
    log: logsByHabit.get(habit.id) ?? [],
  }));
}

export async function getHabits(): Promise<HabitWithLog[]> {
  const supabase = createClient();

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

export async function createHabit(input: HabitInput): Promise<HabitWithLog> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .insert({
      name: input.name,
      color: input.color,
      reminder_time: input.reminder_time,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...(data as Habit), log: [] };
}

export async function updateHabit(
  id: string,
  input: HabitInput
): Promise<Habit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .update({
      name: input.name,
      color: input.color,
      reminder_time: input.reminder_time,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  // habit_logs se elimina en cascada (on delete cascade).
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Marca o desmarca el día de hoy.
 * Devuelve true si quedó marcado, false si quedó desmarcado.
 */
export async function toggleHabitToday(habitId: string): Promise<boolean> {
  const supabase = createClient();
  const today = todayStr();

  const { data: existing, error: selectError } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("log_date", today)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("habit_logs")
    .insert({ habit_id: habitId, log_date: today });
  if (error) throw error;
  return true;
}
