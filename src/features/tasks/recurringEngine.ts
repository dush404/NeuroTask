// NeuroTask — Recurring Task Engine
// Generates next occurrence for daily/weekly/monthly/custom recurring tasks.

import { Task } from "../../types/task";

/**
 * Given a recurring task, calculates the next due date after today.
 */
export function generateNextOccurrence(task: Task): string | undefined {
  if (!task.recurring || !task.dueDate) return undefined;
  const { frequency, interval, daysOfWeek, endDate } = task.recurring;

  const base = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(base);

  switch (frequency) {
    case "daily":
      while (next <= today) next.setDate(next.getDate() + interval);
      break;

    case "weekly":
      while (next <= today) next.setDate(next.getDate() + 7 * interval);
      break;

    case "monthly":
      while (next <= today) next.setMonth(next.getMonth() + interval);
      break;

    case "custom":
      // Move to next valid day-of-week
      if (!daysOfWeek || daysOfWeek.length === 0) break;
      do {
        next.setDate(next.getDate() + 1);
      } while (!daysOfWeek.includes(next.getDay()) || next <= today);
      break;
  }

  const nextStr = next.toISOString().split("T")[0];

  // Respect endDate
  if (endDate && nextStr > endDate) return undefined;

  return nextStr;
}

/**
 * Processes all completed recurring tasks and creates their next occurrence.
 * Call this on app startup.
 */
export function processRecurringTasks(tasks: Task[]): Task[] {
  const newTasks: Task[] = [];

  for (const task of tasks) {
    if (task.status !== "done" || !task.recurring) continue;

    const nextDate = generateNextOccurrence(task);
    if (!nextDate) continue;

    // Check if next occurrence already exists to avoid duplicates
    const alreadyExists = tasks.some(
      (t) =>
        t.title === task.title && t.dueDate === nextDate && t.status !== "done",
    );
    if (alreadyExists) continue;

    newTasks.push({
      ...task,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: "todo",
      dueDate: nextDate,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
    });
  }

  return newTasks;
}
