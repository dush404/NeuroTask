// NeuroTask — Stats Engine
// Productivity scoring, weekly graph data, and heatmap generator.

import { FocusSession, Task } from "../../types/task";

/**
 * Productivity score 0–100
 * 50% task completion weight, 50% focus time weight
 */
export function computeProductivityScore(
  completedToday: number,
  focusMinutesToday: number,
): number {
  const taskScore = Math.min(completedToday * 10, 50);
  const focusScore = Math.min(Math.floor((focusMinutesToday / 60) * 50), 50);
  return taskScore + focusScore;
}

/**
 * Returns bar heights for a 7-day completion chart (Mon → Sun)
 * Each value is a count of tasks completed on that day.
 */
export function getWeeklyCompletionData(tasks: Task[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon=0, Sun=6
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayIndex = 6 - i; // 0=6 days ago, 6=today
    counts[dayIndex] = tasks.filter((t) =>
      t.completedAt?.startsWith(dateStr),
    ).length;
  }

  return counts;
}

/**
 * Returns a 60-day heatmap of completion intensity (0–10 scale)
 */
export function getMonthlyHeatmap(
  tasks: Task[],
): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const today = new Date();

  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = tasks.filter((t) =>
      t.completedAt?.startsWith(dateStr),
    ).length;
    result.push({ date: dateStr, count: Math.min(count, 10) });
  }

  return result;
}

/**
 * Returns total focus minutes for a date
 */
export function getFocusMinutesForDate(
  sessions: FocusSession[],
  date: string,
): number {
  return sessions
    .filter((s) => s.startedAt.startsWith(date) && s.type === "focus")
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/**
 * Formats minutes into human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
