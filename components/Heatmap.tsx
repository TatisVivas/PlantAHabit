import type { HabitWithLog } from "@/lib/types";

export default function Heatmap({ habit }: { habit: HabitWithLog }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // La semana empieza en lunes.
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const doneSet = new Set(habit.log);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push(
      <div key={`pad-${i}`} className="cell" style={{ background: "transparent" }} />
    );
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const done = doneSet.has(ds);
    cells.push(
      <div
        key={ds}
        className="cell"
        title={ds}
        style={{
          background: done ? habit.color : "var(--paper-2)",
          opacity: done ? 1 : 0.5,
        }}
      />
    );
  }

  return <div className="heatmap">{cells}</div>;
}
