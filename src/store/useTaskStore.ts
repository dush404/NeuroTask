// NeuroTask — Task + List Store (v2)
// Extended with smart lists, projects/lists, and recurring task support.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
    AIChatMessage,
    BurnoutMetrics,
    ProductivityScore,
    Task,
    TaskList
} from "../types/task";

// Built-in smart list IDs — never deleted
export const SMART_LISTS = {
  inbox: "inbox",
  today: "today",
  tomorrow: "tomorrow",
  upcoming: "upcoming",
  overdue: "overdue",
};

const DEFAULT_LISTS: TaskList[] = [
  {
    id: "inbox",
    name: "Inbox",
    color: "#3A8DFF",
    icon: "inbox",
    createdAt: new Date().toISOString(),
  },
  {
    id: "work",
    name: "Work",
    color: "#FF6B9D",
    icon: "briefcase",
    createdAt: new Date().toISOString(),
  },
  {
    id: "personal",
    name: "Personal",
    color: "#4ECDC4",
    icon: "user",
    createdAt: new Date().toISOString(),
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const isOverdue = (dueDate: string) => dueDate < todayStr();
const isUpcoming = (dueDate: string) => dueDate > tomorrowStr();

// ─── State Shape ────────────────────────────────────────────────────────────
interface TaskState {
  tasks: Task[];
  lists: TaskList[];
  aiMessages: AIChatMessage[];
  isAILoading: boolean;
  activeListId: string;
  totalFocusMinutesToday: number;

  // Task CRUD
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  reorderTask: (id: string, newOrder: number) => void;

  // List CRUD
  addList: (list: TaskList) => void;
  updateList: (id: string, updates: Partial<TaskList>) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string) => void;

  // AI chat
  addMessage: (message: AIChatMessage) => void;
  clearMessages: () => void;
  setAILoading: (loading: boolean) => void;
  addFocusMinutes: (minutes: number) => void;

  // Smart list selectors
  getInboxTasks: () => Task[];
  getTodayTasks: () => Task[];
  getTomorrowTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getTasksByList: (listId: string) => Task[];
  getTasksByTag: (tag: string) => Task[];
  getCompletedToday: () => Task[];

  // Stats
  getBurnoutMetrics: () => BurnoutMetrics;
  getProductivityScore: () => ProductivityScore;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      lists: DEFAULT_LISTS,
      aiMessages: [],
      isAILoading: false,
      activeListId: "inbox",
      totalFocusMinutesToday: 0,

      // ── Task CRUD ──────────────────────────────────────────────────────────
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      completeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "done", completedAt: new Date().toISOString() }
              : t,
          ),
        })),

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((sub) =>
                    sub.id === subtaskId
                      ? { ...sub, completed: !sub.completed }
                      : sub,
                  ),
                }
              : t,
          ),
        })),

      reorderTask: (id, newOrder) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, sortOrder: newOrder } : t,
          ),
        })),

      // ── List CRUD ──────────────────────────────────────────────────────────
      addList: (list) => set((s) => ({ lists: [...s.lists, list] })),

      updateList: (id, updates) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      deleteList: (id) =>
        set((s) => ({
          lists: s.lists.filter((l) => l.id !== id),
          tasks: s.tasks.map((t) =>
            t.listId === id ? { ...t, listId: "inbox" } : t,
          ),
        })),

      setActiveList: (id) => set({ activeListId: id }),

      // ── AI ─────────────────────────────────────────────────────────────────
      addMessage: (message) =>
        set((s) => ({ aiMessages: [...s.aiMessages, message] })),

      clearMessages: () => set({ aiMessages: [] }),
      setAILoading: (loading) => set({ isAILoading: loading }),
      addFocusMinutes: (minutes) =>
        set((s) => ({
          totalFocusMinutesToday: s.totalFocusMinutesToday + minutes,
        })),

      // ── Smart List Selectors ───────────────────────────────────────────────
      getInboxTasks: () =>
        get().tasks.filter((t) => t.listId === "inbox" && t.status !== "done"),

      getTodayTasks: () => {
        const today = todayStr();
        return get().tasks.filter(
          (t) => t.dueDate === today && t.status !== "done",
        );
      },

      getTomorrowTasks: () => {
        const tomorrow = tomorrowStr();
        return get().tasks.filter(
          (t) => t.dueDate === tomorrow && t.status !== "done",
        );
      },

      getUpcomingTasks: () =>
        get().tasks.filter(
          (t) => t.dueDate && isUpcoming(t.dueDate) && t.status !== "done",
        ),

      getOverdueTasks: () =>
        get().tasks.filter(
          (t) => t.dueDate && isOverdue(t.dueDate) && t.status !== "done",
        ),

      getTasksByList: (listId) =>
        get().tasks.filter((t) => t.listId === listId && t.status !== "done"),

      getTasksByTag: (tag) =>
        get().tasks.filter((t) => t.tags.includes(tag) && t.status !== "done"),

      getCompletedToday: () => {
        const today = todayStr();
        return get().tasks.filter((t) => t.completedAt?.startsWith(today));
      },

      // ── Stats ──────────────────────────────────────────────────────────────
      getBurnoutMetrics: (): BurnoutMetrics => {
        const due = get().getTodayTasks();
        const done = get().getCompletedToday();
        const total = due.length + done.length;
        const rate = total > 0 ? done.length / total : 1;
        const overloaded = due.length > 8 || rate < 0.3;
        return {
          taskLoad: due.length,
          completionRate: rate,
          streakDays: 0,
          isOverloaded: overloaded,
          suggestion: overloaded
            ? "Consider a lighter focus day tomorrow. Rest is productive too."
            : undefined,
        };
      },

      getProductivityScore: (): ProductivityScore => {
        const done = get().getCompletedToday();
        const focus = get().totalFocusMinutesToday;
        const taskScore = Math.min(done.length * 10, 50);
        const focusScore = Math.min(Math.floor((focus / 60) * 50), 50);
        return {
          score: taskScore + focusScore,
          tasksCompleted: done.length,
          focusMinutes: focus,
          weeklyHeatmap: [3, 5, 7, 4, 8, 6, 2],
        };
      },
    }),
    {
      name: "neurotask-tasks-v2",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        lists: s.lists,
        aiMessages: s.aiMessages,
        totalFocusMinutesToday: s.totalFocusMinutesToday,
      }),
    },
  ),
);
