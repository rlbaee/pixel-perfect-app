import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "@/integrations/firebase/client";

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
  const db = getDb();
  const q = query(collection(db, "notes"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    category: d.data().category as string,
    content: d.data().content as string,
    created_at:
      (d.data().created_at as { toDate?: () => Date } | undefined)?.toDate()?.toISOString() ??
      new Date().toISOString(),
  }));
}

export async function addNote(input: { category: string; content: string }) {
  const db = getDb();
  await addDoc(collection(db, "notes"), {
    category: input.category,
    content: input.content,
    created_at: serverTimestamp(),
  });
}

export async function deleteNote(id: string) {
  const db = getDb();
  await deleteDoc(doc(db, "notes", id));
}

export async function fetchHabits(): Promise<Habit[]> {
  const db = getDb();
  const q = query(collection(db, "habits"), orderBy("position", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    emoji: d.data().emoji as string,
    accent: d.data().accent as string,
    position: d.data().position as number,
  }));
}

export async function fetchChecks(): Promise<HabitCheck[]> {
  const db = getDb();
  const q = query(collection(db, "habit_checks"), where("day", ">=", dayKey(60)));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    habit_id: d.data().habit_id as string,
    day: d.data().day as string,
  }));
}

export async function toggleCheck(habitId: string, checked: boolean) {
  const db = getDb();
  const checkId = `${habitId}_${dayKey(0)}`;
  if (checked) {
    await deleteDoc(doc(db, "habit_checks", checkId));
  } else {
    await setDoc(doc(db, "habit_checks", checkId), {
      habit_id: habitId,
      day: dayKey(0),
    });
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
