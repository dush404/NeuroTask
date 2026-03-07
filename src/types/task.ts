// NeuroTask — Core Types & Interfaces (v2)

export type Priority = 1 | 2 | 3 | 4; // 1=urgent, 4=none
export type TaskStatus = "todo" | "in_progress" | "done";
export type ViewMode = "list" | "kanban";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "custom";
export type TaskType = "normal" | "toGo" | "withSubtask" | "project" | "manual";
export type EnergyType = "deep" | "light";

// ─── Task ────────────────────────────────────────────────────────────────────
export interface RecurringRule {
  frequency: RecurringFrequency;
  interval: number; // e.g. every 2 weeks
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, ...
  endDate?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface TaskComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  priority: Priority;
  status: TaskStatus;
  taskType?: TaskType;
  listId: string;
  projectId?: string;
  tags: string[];
  emoji?: string;
  dueDate?: string; // ISO date string
  dueTime?: string; // HH:mm
  reminder?: string; // ISO date-time string
  // toGo fields
  fromLocation?: string;
  toLocation?: string;
  createdAt: string;
  completedAt?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  subtasks: Subtask[];
  recurring?: RecurringRule;
  energyType?: EnergyType;
  assigneeId?: string; // collaboration-ready
  comments: TaskComment[];
  sortOrder: number; // for drag-reorder
}

// ─── List / Project ───────────────────────────────────────────────────────────
export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  isShared?: boolean; // collaboration-ready
}

// ─── Habit ───────────────────────────────────────────────────────────────────
export type HabitFrequency = "daily" | "weekdays" | "weekends" | "custom";

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
  xpEarned: number;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[]; // for custom frequency
  targetMinutes?: number; // optional daily focus duration target
  streak: number;
  longestStreak: number;
  totalXP: number;
  logs: HabitLog[];
  createdAt: string;
}

// ─── Habit Slot (time-blocked habit session) ──────────────────────────────────
export interface HabitSlot {
  id: string;
  habitId?: string; // optional link to a habit
  name: string;
  icon: string;
  color: string;
  startTime: string; // HH:MM
  durationMinutes: number;
  createdAt: string;
}

// ─── Focus / Pomodoro ────────────────────────────────────────────────────────
export type TimerStatus = "idle" | "running" | "paused" | "break";

export interface FocusSession {
  id: string;
  taskId?: string;
  startedAt: string;
  durationMinutes: number;
  type: "focus" | "short_break" | "long_break";
}

export interface PomodoroSettings {
  focusMinutes: number; // default 25
  shortBreak: number; // default 5
  longBreak: number; // default 15
  sessionsBeforeLong: number; // default 4
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export interface AIBreakdownResult {
  subtasks: Subtask[];
  totalEstimatedMinutes: number;
  difficultyRating: "easy" | "medium" | "hard";
  suggestedPriority: Priority;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export interface ProductivityScore {
  score: number;
  tasksCompleted: number;
  focusMinutes: number;
  weeklyHeatmap: number[]; // 7 values Mon–Sun
}

export interface BurnoutMetrics {
  taskLoad: number;
  completionRate: number;
  streakDays: number;
  isOverloaded: boolean;
  suggestion?: string;
}
