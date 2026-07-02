export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  /** Hora del recordatorio en formato "HH:MM" o null si no tiene. */
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  /** Fecha en formato "YYYY-MM-DD". */
  log_date: string;
  created_at: string;
}

/** Hábito con sus fechas marcadas, listo para la UI. */
export interface HabitWithLog extends Habit {
  /** Fechas "YYYY-MM-DD" en las que se marcó el hábito. */
  log: string[];
}

export type GrowthStage = "seed" | "sprout" | "sapling" | "bush" | "bloom";
