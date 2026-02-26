// NeuroTask — Pomodoro Timer Component
// Animated circular countdown ring. Shows minutes:seconds remaining.
// Colors shift blue → orange as time runs low.

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useFocusStore } from "../store/useFocusStore";
import { useTaskStore } from "../store/useTaskStore";

const SIZE = 200;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PomodoroTimer: React.FC = () => {
  const {
    status,
    secondsLeft,
    settings,
    sessionCount,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipToBreak,
    tickSecond,
  } = useFocusStore();
  const { addFocusMinutes } = useTaskStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manage the tick interval
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        tickSecond();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // Sync focus minutes to task store when a session logs
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "running" && status === "break") {
      addFocusMinutes(settings.focusMinutes);
    }
    prevStatus.current = status;
  }, [status]);

  const totalSeconds =
    status === "break"
      ? (sessionCount % settings.sessionsBeforeLong === 0
          ? settings.longBreak
          : settings.shortBreak) * 60
      : settings.focusMinutes * 60;

  const progress = secondsLeft / totalSeconds;
  const strokeDash = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const ringColor =
    status === "break"
      ? Colors.success
      : progress < 0.2
        ? Colors.priorityHigh
        : Colors.accent;

  const isRunning = status === "running";
  const label =
    status === "break"
      ? "Break Time 🌿"
      : status === "idle"
        ? "Ready to Focus"
        : "Focusing 🧠";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.glass}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.timeOverlay}>
          <Text style={[styles.time, { color: ringColor }]}>
            {minutes}:{seconds}
          </Text>
          <Text style={styles.session}>
            Session #{Math.max(sessionCount, 1)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.iconBtn} onPress={resetTimer}>
          <RotateCcw size={22} color={Colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.mainBtn, { backgroundColor: ringColor }]}
          onPress={isRunning ? pauseTimer : () => resumeTimer()}
        >
          {isRunning ? (
            <Pause size={28} color="#fff" />
          ) : (
            <Play size={28} color="#fff" />
          )}
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={skipToBreak}>
          <SkipForward size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: Spacing.md },
  label: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeightMedium,
  },
  ringWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  timeOverlay: {
    position: "absolute",
    alignItems: "center",
  },
  time: {
    fontSize: 44,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 2,
  },
  session: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
  },
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBtn: {
    padding: Spacing.sm,
  },
});
