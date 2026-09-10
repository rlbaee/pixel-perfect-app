import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  addNote,
  deleteNote,
  dayKey,
  fetchChecks,
  fetchHabits,
  fetchNotes,
  lastFiveDays,
  relativeTime,
  streakFor,
  toggleCheck,
  type Habit,
  type HabitCheck,
  type Note,
} from "@/lib/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nimbus — Notes, Habits & Daily Stats" },
      {
        name: "description",
        content:
          "Nimbus is a calm personal dashboard for quick notes, daily habit streaks and at-a-glance stats.",
      },
      { property: "og:title", content: "Nimbus — Notes, Habits & Daily Stats" },
      {
        property: "og:description",
        content:
          "Nimbus is a calm personal dashboard for quick notes, daily habit streaks and at-a-glance stats.",
      },
    ],
  }),
  component: Dashboard,
});

const accentDot: Record<string, string> = {
  brand: "bg-brand",
  accent: "bg-accent-violet",
  teal: "bg-teal",
};
const accentDotSoft: Record<string, string> = {
  brand: "bg-brand/30",
  accent: "bg-accent-violet/30",
  teal: "bg-teal/40",
};
const accentTile: Record<string, string> = {
  brand: "bg-gradient-to-br from-brand to-brand/40",
  accent: "bg-gradient-to-br from-accent-violet to-accent-violet/40",
  teal: "bg-gradient-to-br from-teal to-teal/40",
};
const accentBar: Record<number, string> = {
  0: "bg-brand/70",
  1: "bg-accent-violet/70",
  2: "bg-brand/50",
  3: "bg-teal/70",
  4: "bg-gradient-to-t from-brand to-accent-violet",
};
const categoryTone: Record<string, string> = {
  Idea: "text-brand",
  Reading: "text-accent-violet",
};

function Dashboard() {
  const qc = useQueryClient();
  const notes = useQuery({ queryKey: ["notes"], queryFn: fetchNotes });
  const habits = useQuery({ queryKey: ["habits"], queryFn: fetchHabits });
  const checks = useQuery({ queryKey: ["checks"], queryFn: fetchChecks });

  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");

  const create = useMutation({
    mutationFn: () => addNote({ category: "Note", content: draft.trim() }),
    onSuccess: () => {
      setDraft("");
      setComposing(false);
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; checked: boolean }) => toggleCheck(v.id, v.checked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checks"] }),
  });

  const noteList: Note[] = notes.data ?? [];
  const habitList: Habit[] = habits.data ?? [];
  const checkList: HabitCheck[] = checks.data ?? [];

  const today = dayKey(0);
  const week = lastFiveDays();
  const doneToday = habitList.filter((h) =>
    checkList.some((c) => c.habit_id === h.id && c.day === today),
  ).length;
  const notesThisWeek = noteList.filter(
    (n) => Date.now() - new Date(n.created_at).getTime() < 7 * 86400000,
  ).length;
  const bestStreak = habitList.reduce((m, h) => Math.max(m, streakFor(h.id, checkList)), 0);
  const perDay = week.map((d) => checkList.filter((c) => c.day === d).length);
  const maxPerDay = Math.max(1, ...perDay);

  return (
    <div className="motif relative min-h-screen w-full overflow-hidden">
      <div className="relative mx-auto max-w-[1400px] px-5 py-6 sm:px-8">
        <header className="glass flex items-center justify-between rounded-3xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-accent-violet shadow-lg shadow-brand/30">
              <span className="font-display text-lg font-extrabold text-background">N</span>
            </div>
            <div>
              <p className="font-display text-lg leading-none font-bold tracking-tight text-ink">
                Nimbus
              </p>
              <p className="mt-1 text-[11px] text-ink/50">Personal dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden w-64 items-center gap-2 rounded-full border border-background/60 bg-background/50 px-4 py-2 text-sm backdrop-blur-md sm:flex">
              <span className="text-ink/35">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-accent-violet to-brand text-sm font-semibold text-background ring-2 ring-background/70">
              AR
            </div>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-12 gap-4 sm:gap-5">
          {/* Notes */}
          <section className="glass col-span-12 rounded-3xl p-5 lg:col-span-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-bold tracking-tight text-ink">Notes</h2>
              <button
                onClick={() => setComposing((v) => !v)}
                className="rounded-full bg-gradient-to-br from-brand to-accent-violet px-3 py-1.5 text-xs font-semibold text-background shadow-md shadow-brand/30"
              >
                {composing ? "Close" : "+ New"}
              </button>
            </div>

            {composing && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) create.mutate();
                }}
                className="mb-3 rounded-2xl border border-background/60 bg-background/50 p-3"
              >
                <textarea
                  autoFocus
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink/80 outline-none placeholder:text-ink/35"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!draft.trim() || create.isPending}
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-40"
                  >
                    Save note
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {noteList.map((note, i) => (
                <div
                  key={note.id}
                  className={`group rounded-2xl border border-background/60 p-4 ${
                    i === 0
                      ? "bg-gradient-to-br from-brand/15 to-accent-violet/10"
                      : "bg-background/40"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase ${
                        categoryTone[note.category] ?? "text-ink/40"
                      }`}
                    >
                      {note.category}
                    </span>
                    <span className="text-[11px] text-ink/40">
                      {relativeTime(note.created_at)}
                    </span>
                    <button
                      onClick={() => remove.mutate(note.id)}
                      aria-label="Delete note"
                      className="ml-auto text-[11px] text-ink/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink/70"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-ink/80">{note.content}</p>
                </div>
              ))}
              {!notes.isLoading && noteList.length === 0 && (
                <p className="text-sm text-ink/40">No notes yet — add your first one.</p>
              )}
            </div>
          </section>

          {/* Habits */}
          <section className="glass col-span-12 rounded-3xl p-5 lg:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-bold tracking-tight text-ink">Habits</h2>
              <span className="text-[11px] font-semibold text-ink/40">Today</span>
            </div>
            <div className="space-y-3">
              {habitList.map((habit) => {
                const checkedToday = checkList.some(
                  (c) => c.habit_id === habit.id && c.day === today,
                );
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggle.mutate({ id: habit.id, checked: checkedToday })}
                    className={`flex w-full items-center gap-3 rounded-2xl border border-background/60 bg-background/40 p-3 text-left transition-transform hover:-translate-y-0.5 ${
                      checkedToday ? "ring-1 ring-brand/40" : ""
                    }`}
                  >
                    <div
                      className={`grid size-11 place-items-center rounded-xl text-xl ${
                        accentTile[habit.accent] ?? accentTile.brand
                      }`}
                    >
                      {habit.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{habit.name}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {week.map((d) => {
                          const on = checkList.some(
                            (c) => c.habit_id === habit.id && c.day === d,
                          );
                          return (
                            <span
                              key={d}
                              className={`size-1.5 rounded-full ${
                                on
                                  ? (accentDot[habit.accent] ?? accentDot.brand)
                                  : (accentDotSoft[habit.accent] ?? accentDotSoft.brand)
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg font-bold text-ink">
                        {streakFor(habit.id, checkList)}
                      </p>
                      <p className="-mt-1 text-[10px] text-ink/40">day streak</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Stats */}
          <section className="glass col-span-12 rounded-3xl p-5 lg:col-span-3">
            <h2 className="font-display mb-4 text-base font-bold tracking-tight text-ink">
              Quick stats
            </h2>
            <div className="space-y-3">
              <div className="rounded-2xl border border-background/60 bg-gradient-to-br from-brand/15 to-accent-violet/10 p-4">
                <p className="text-[11px] text-ink/50">Habits done today</p>
                <p className="font-display mt-1 text-3xl font-extrabold text-ink">
                  {doneToday}
                  <span className="text-lg text-ink/50">/{habitList.length || 0}</span>
                </p>
                <p className="mt-1 text-[11px] font-semibold text-brand">
                  Best streak {bestStreak} days
                </p>
              </div>
              <div className="rounded-2xl border border-background/60 bg-background/40 p-4">
                <p className="text-[11px] text-ink/50">Notes this week</p>
                <p className="font-display mt-1 text-3xl font-extrabold text-ink">
                  {notesThisWeek}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-ink/40">
                  {noteList.length} saved in total
                </p>
              </div>
              <div className="rounded-2xl border border-background/60 bg-background/40 p-4">
                <p className="text-[11px] text-ink/50">Habit consistency</p>
                <div className="mt-2 flex h-20 items-end gap-2">
                  {perDay.map((count, i) => (
                    <div key={week[i]} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md ${accentBar[i]}`}
                        style={{ height: `${Math.max(8, (count / maxPerDay) * 72)}px` }}
                      />
                      <span className="text-[9px] text-ink/40">
                        {new Date(`${week[i]}T00:00:00`).toLocaleDateString(undefined, {
                          weekday: "narrow",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink/35">
          Everything you add is saved to the cloud — no account needed.
        </p>
      </div>
    </div>
  );
}
