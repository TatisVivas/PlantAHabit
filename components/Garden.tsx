"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import HabitCard from "./HabitCard";
import HabitModal from "./HabitModal";
import {
  createHabit,
  deleteHabit,
  getHabits,
  toggleHabitToday,
  updateHabit,
  type HabitInput,
} from "@/lib/habits";
import { fmtDateLabel, todayStr } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";
import type { HabitWithLog } from "@/lib/types";

type ModalState = { open: false } | { open: true; habit: HabitWithLog | null };

function subscribeConnectivity(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

interface GardenProps {
  userEmail: string;
  initialHabits: HabitWithLog[];
  /** true si el servidor no pudo leer las tablas (falta correr schema.sql). */
  schemaError: boolean;
}

export default function Garden({
  userEmail,
  initialHabits,
  schemaError,
}: GardenProps) {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitWithLog[]>(initialHabits);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [banner, setBanner] = useState<string | null>(null);
  // Recordatorios ya mostrados hoy: habitId -> fecha.
  const reminded = useRef(new Map<string, string>());

  const offline = useSyncExternalStore(
    subscribeConnectivity,
    () => !navigator.onLine,
    () => false
  );

  const load = useCallback(async () => {
    try {
      setHabits(await getHabits());
    } catch {
      // Se conserva el último estado conocido.
    }
  }, []);

  // Al recuperar la conexión, recargar los datos.
  useEffect(() => {
    const goOnline = () => load();
    window.addEventListener("online", goOnline);
    return () => window.removeEventListener("online", goOnline);
  }, [load]);

  // ---------- Recordatorios ----------
  const checkReminders = useCallback(() => {
    if (!habits) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const nowStr = `${hh}:${mm}`;
    const today = todayStr();

    for (const habit of habits) {
      if (!habit.reminder_time) continue;
      const reminder = habit.reminder_time.slice(0, 5);
      const doneToday = habit.log.includes(today);
      const alreadyReminded = reminded.current.get(habit.id) === today;
      if (!doneToday && !alreadyReminded && reminder <= nowStr) {
        reminded.current.set(habit.id, today);
        setBanner(`Es hora de: ${habit.name} (recordatorio ${reminder})`);
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Recordatorio de hábito", { body: habit.name });
          } catch {
            // Algunos navegadores móviles no permiten new Notification().
          }
        }
      }
    }
  }, [habits]);

  useEffect(() => {
    const t = setTimeout(checkReminders, 1000);
    const interval = setInterval(checkReminders, 30000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [checkReminders]);

  // ---------- Acciones ----------
  async function handleToggle(habit: HabitWithLog) {
    const today = todayStr();
    // Actualización optimista para que la UI responda al instante.
    setHabits((prev) =>
      prev
        ? prev.map((h) =>
            h.id === habit.id
              ? {
                  ...h,
                  log: h.log.includes(today)
                    ? h.log.filter((d) => d !== today)
                    : [...h.log, today],
                }
              : h
          )
        : prev
    );
    try {
      await toggleHabitToday(habit.id);
    } catch {
      await load(); // revertir al estado real
    }
  }

  async function handleDelete(habit: HabitWithLog) {
    setHabits((prev) => (prev ? prev.filter((h) => h.id !== habit.id) : prev));
    try {
      await deleteHabit(habit.id);
    } catch {
      await load();
    }
  }

  async function handleSave(input: HabitInput) {
    if (modal.open && modal.habit) {
      const updated = await updateHabit(modal.habit.id, input);
      setHabits((prev) =>
        prev
          ? prev.map((h) => (h.id === updated.id ? { ...h, ...updated } : h))
          : prev
      );
      reminded.current.delete(updated.id);
    } else {
      const created = await createHabit(input);
      setHabits((prev) => (prev ? [...prev, created] : [created]));
      if (
        input.reminder_time &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission();
      }
    }
    setModal({ open: false });
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <p className="eyebrow">Tu jardín personal</p>
          <h1>Mi Jardín de Hábitos</h1>
        </div>
        <div>
          {/* La fecha depende de la zona horaria del dispositivo, por eso
              puede diferir del HTML generado en el servidor. */}
          <div className="today" suppressHydrationWarning>
            {fmtDateLabel()}
          </div>
          <div className="today" style={{ opacity: 0.5 }}>
            {userEmail}
          </div>
          <button className="signout-btn" onClick={handleSignOut}>
            cerrar sesión
          </button>
        </div>
      </header>

      {offline && (
        <div className="offline-note" role="status">
          📡 Sin conexión: puedes ver tu jardín, pero para marcar o editar
          hábitos necesitas internet.
        </div>
      )}

      {banner && (
        <div className="banner show" role="alert">
          <span>⏰ {banner}</span>
          <button onClick={() => setBanner(null)}>Entendido</button>
        </div>
      )}

      <div className="add-row">
        <button
          className="btn-plant"
          onClick={() => setModal({ open: true, habit: null })}
        >
          🌱 Plantar un hábito
        </button>
      </div>

      {schemaError && habits.length === 0 ? (
        <div className="empty">
          <span className="seed">🥀</span>
          No se pudo leer la base de datos. ¿Ya ejecutaste{" "}
          <code>supabase/schema.sql</code> en el SQL Editor de Supabase?
        </div>
      ) : habits.length === 0 ? (
        <div className="empty">
          <span className="seed">🌰</span>
          Aún no has plantado ningún hábito.
          <br />
          Planta el primero y empieza a cultivarlo cada día.
        </div>
      ) : (
        <div className="grid">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onEdit={(h) => setModal({ open: true, habit: h })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <footer className="note">
        los recordatorios funcionan mientras la app esté abierta
      </footer>

      {modal.open && (
        <HabitModal
          habit={modal.habit}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
