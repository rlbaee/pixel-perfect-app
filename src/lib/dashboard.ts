import { supabase } from "@/integrations/supabase/client";

export type Note = {
  id: string;
  category: string;
  content: string;
  created_at: string;
};

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  position: number;
};

export type HabitCheck = {
  id: string;
  habit_id: string;
  day: string;
};

export function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const lastFiveDays = () => [4, 3, 2, 1, 0].map((o) => dayKey(o));

export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("id, category, content, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addNote(input: { category: string; content: string }) {
  const { error } = await supabase.from("notes").insert(input);
  if (error) throw error;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, emoji, accent, position")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchChecks(): Promise<HabitCheck[]> {
  const { data, error } = await supabase
    .from("habit_checks")
    .select("id, habit_id, day")
    .gte("day", dayKey(60));
  if (error) throw error;
  return data ?? [];
}

export async function toggleCheck(habitId: string, checked: boolean) {
  if (checked) {
    const { error } = await supabase
      .from("habit_checks")
      .delete()
      .eq("habit_id", habitId)
      .eq("day", dayKey(0));
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("habit_checks")
      .insert({ habit_id: habitId, day: dayKey(0) });
    if (error) throw error;
  }
}

export function streakFor(habitId: string, checks: HabitCheck[]) {
  const days = new Set(checks.filter((c) => c.habit_id === habitId).map((c) => c.day));
  let streak = 0;
  let offset = days.has(dayKey(0)) ? 0 : 1;
  while (days.has(dayKey(offset))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
