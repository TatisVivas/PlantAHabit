import { redirect } from "next/navigation";
import Garden from "@/components/Garden";
import { getHabitsServer } from "@/lib/habits.server";
import { createClient } from "@/lib/supabase/server";
import type { HabitWithLog } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let initialHabits: HabitWithLog[] = [];
  let schemaError = false;
  try {
    initialHabits = await getHabitsServer();
  } catch {
    // Suele significar que aún no se ejecutó supabase/schema.sql.
    schemaError = true;
  }

  return (
    <Garden
      userEmail={user.email ?? ""}
      initialHabits={initialHabits}
      schemaError={schemaError}
    />
  );
}
