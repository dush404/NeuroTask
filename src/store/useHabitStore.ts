// NeuroTask — Habit Store
// Tracks habits, streaks, daily check-ins, XP rewards, and history logs.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Habit, HabitLog, HabitSlot } from "../types/task";

const todayStr = () => new Date().toISOString().split("T")[0];
const XP_PER_COMPLETION = 10;
const XP_STREAK_BONUS = 5; // bonus per 7-day streak milestone

interface HabitState {
  habits: Habit[];
  slots: HabitSlot[];

  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;

  // Slots
  addSlot: (slot: HabitSlot) => void;
  removeSlot: (id: string) => void;
  updateSlot: (id: string, updates: Partial<HabitSlot>) => void;

  // Check-in: mark today complete/incomplete
  checkIn: (habitId: string, completed: boolean) => void;

  // Selectors
  getTodayStatus: (habitId: string) => boolean;
  getHeatmapData: (habitId: string, days?: number) => HabitLog[];
  getCompletedTodayCount: () => number;
  getTotalXP: () => number;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      slots: [],

      addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),

      updateHabit: (id, updates) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      addSlot: (slot) => set((s) => ({ slots: [...s.slots, slot] })),
      removeSlot: (id) =>
        set((s) => ({ slots: s.slots.filter((sl) => sl.id !== id) })),
      updateSlot: (id, updates) =>
        set((s) => ({
          slots: s.slots.map((sl) =>
            sl.id === id ? { ...sl, ...updates } : sl,
          ),
        })),

      checkIn: (habitId, completed) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;

            const today = todayStr();
            const existingLog = h.logs.find((l) => l.date === today);
            const xpEarned = completed ? XP_PER_COMPLETION : 0;

            // Update or add today's log
            const updatedLogs = existingLog
              ? h.logs.map((l) =>
                  l.date === today ? { ...l, completed, xpEarned } : l,
                )
              : [...h.logs, { date: today, completed, xpEarned }];

            // Recalculate streak from logs (consecutive completed days ending today)
            const sortedLogs = [...updatedLogs].sort((a, b) =>
              b.date.localeCompare(a.date),
            );
            let streak = 0;
            let cursor = new Date();
            for (const log of sortedLogs) {
              const logDate = cursor.toISOString().split("T")[0];
              if (log.date === logDate && log.completed) {
                streak++;
                cursor.setDate(cursor.getDate() - 1);
              } else {
                break;
              }
            }

            const totalXP = updatedLogs.reduce((sum, l) => sum + l.xpEarned, 0);

            return {
              ...h,
              logs: updatedLogs,
              streak,
              longestStreak: Math.max(h.longestStreak, streak),
              totalXP,
            };
          }),
        })),

      getTodayStatus: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return false;
        const today = todayStr();
        return habit.logs.find((l) => l.date === today)?.completed ?? false;
      },

      // Returns the last `days` of logs padded with empty entries for missing days
      getHeatmapData: (habitId, days = 30) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return [];
        const result: HabitLog[] = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const found = habit.logs.find((l) => l.date === dateStr);
          result.push(
            found ?? { date: dateStr, completed: false, xpEarned: 0 },
          );
        }
        return result;
      },

      getCompletedTodayCount: () => {
        const today = todayStr();
        return get().habits.filter((h) =>
          h.logs.find((l) => l.date === today && l.completed),
        ).length;
      },

      getTotalXP: () => get().habits.reduce((sum, h) => sum + h.totalXP, 0),
    }),
    {
      name: "neurotask-habits",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ habits: s.habits, slots: s.slots }),
    },
  ),
);
