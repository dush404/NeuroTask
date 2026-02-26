// NeuroTask — Focus / Pomodoro Store
// Tracks timer state, pomodoro sessions, and session history.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FocusSession, PomodoroSettings, TimerStatus } from "../types/task";

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLong: 4,
};

interface FocusState {
  settings: PomodoroSettings;
  status: TimerStatus;
  secondsLeft: number;
  sessionCount: number; // sessions completed this cycle
  currentTaskId?: string;
  sessions: FocusSession[]; // history

  // Actions
  updateSettings: (s: Partial<PomodoroSettings>) => void;
  startTimer: (taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tickSecond: () => void; // called every second by the UI timer
  skipToBreak: () => void;
  logSession: (session: FocusSession) => void;

  // Selectors
  getTodaySessions: () => FocusSession[];
  getTodayFocusMinutes: () => number;
}

const todayStr = () => new Date().toISOString().split("T")[0];

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      status: "idle",
      secondsLeft: DEFAULT_SETTINGS.focusMinutes * 60,
      sessionCount: 0,
      sessions: [],

      updateSettings: (s) =>
        set((st) => ({
          settings: { ...st.settings, ...s },
          secondsLeft: (s.focusMinutes ?? st.settings.focusMinutes) * 60,
          status: "idle",
        })),

      startTimer: (taskId) =>
        set((st) => ({
          status: "running",
          currentTaskId: taskId,
          secondsLeft:
            st.status === "idle"
              ? st.settings.focusMinutes * 60
              : st.secondsLeft,
        })),

      pauseTimer: () => set({ status: "paused" }),
      resumeTimer: () => set({ status: "running" }),

      resetTimer: () =>
        set((st) => ({
          status: "idle",
          secondsLeft: st.settings.focusMinutes * 60,
          currentTaskId: undefined,
        })),

      // Called every second from UI — handles auto-transitions
      tickSecond: () => {
        const { secondsLeft, status, sessionCount, settings, currentTaskId } =
          get();
        if (status !== "running") return;

        if (secondsLeft > 1) {
          set({ secondsLeft: secondsLeft - 1 });
          return;
        }

        // Timer finished — log session and start break
        const newCount = sessionCount + 1;
        const isLongBreak = newCount % settings.sessionsBeforeLong === 0;
        const breakDuration = isLongBreak
          ? settings.longBreak
          : settings.shortBreak;

        get().logSession({
          id: `${Date.now()}`,
          taskId: currentTaskId,
          startedAt: new Date(
            Date.now() - settings.focusMinutes * 60 * 1000,
          ).toISOString(),
          durationMinutes: settings.focusMinutes,
          type: "focus",
        });

        set({
          sessionCount: newCount,
          status: "break",
          secondsLeft: breakDuration * 60,
          currentTaskId: undefined,
        });
      },

      skipToBreak: () => {
        const { settings, sessionCount } = get();
        const newCount = sessionCount + 1;
        const isLong = newCount % settings.sessionsBeforeLong === 0;
        set({
          status: "break",
          sessionCount: newCount,
          secondsLeft: (isLong ? settings.longBreak : settings.shortBreak) * 60,
        });
      },

      logSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),

      getTodaySessions: () => {
        const today = todayStr();
        return get().sessions.filter((s) => s.startedAt.startsWith(today));
      },

      getTodayFocusMinutes: () =>
        get()
          .getTodaySessions()
          .filter((s) => s.type === "focus")
          .reduce((sum, s) => sum + s.durationMinutes, 0),
    }),
    {
      name: "neurotask-focus",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        sessions: s.sessions,
        sessionCount: s.sessionCount,
      }),
    },
  ),
);
