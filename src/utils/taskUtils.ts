// NeuroTask - Smart Utility Functions
// Time estimation and burnout analytics helpers.

import { Task } from "../types/task";

// ---------- Smart Time Estimator ----------
// Heuristic: average of historical task durations for similar complexity.
// Complexity is approximated by word count in the title.
export function estimateTaskMinutes(
  title: string,
  completedTasks: Task[],
): number {
  const wordCount = title.trim().split(/\s+/).length;

  // Use historical tasks that have actual duration recorded
  const withActuals = completedTasks.filter(
    (t) => t.actualMinutes !== undefined,
  );

  if (withActuals.length === 0) {
    // Fallback: 10 minutes per word, capped at 120
    return Math.min(wordCount * 10, 120);
  }

  // Average actual minutes from similar-length tasks (±3 words tolerance)
  const similar = withActuals.filter((t) => {
    const otherWords = t.title.trim().split(/\s+/).length;
    return Math.abs(otherWords - wordCount) <= 3;
  });

  const pool = similar.length > 0 ? similar : withActuals;
  const avg =
    pool.reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0) / pool.length;

  return Math.round(avg);
}

// ---------- Burnout Score ----------
// Returns 0-100 burnout risk score. Higher = more risk.
export function computeBurnoutScore(params: {
  tasksToday: number;
  completionRate: number; // 0-1
  streakDays: number;
}): number {
  const { tasksToday, completionRate, streakDays } = params;

  let score = 0;

  // Heavy task load is a strong burnout signal
  if (tasksToday > 10) score += 40;
  else if (tasksToday > 7) score += 25;
  else if (tasksToday > 5) score += 10;

  // Low completion rate signals overwhelm
  if (completionRate < 0.3) score += 30;
  else if (completionRate < 0.5) score += 15;

  // Long streaks without breaks risk burnout
  if (streakDays > 14) score += 30;
  else if (streakDays > 7) score += 15;

  return Math.min(score, 100);
}

// ---------- Generate Unique ID ----------
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Format Duration ----------
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---------- Priority Colour ----------
// Accepts both legacy ('low'|'medium'|'high') and new ('p1'|'p2'|'p3'|'p4') priority formats
import { Colors } from "../constants/theme";
import { Priority } from "../types/task";

export function priorityColor(priority: Priority | string): string {
  switch (priority) {
    case "p1":
    case "high":
      return Colors.priorityHigh;
    case "p2":
    case "medium":
      return Colors.priorityMedium;
    case "p3":
    case "low":
      return Colors.priorityLow;
    case "p4":
    default:
      return Colors.textMuted;
  }
}
