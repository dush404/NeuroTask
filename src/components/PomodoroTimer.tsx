import {
    Activity,
    Brain,
    Clock,
    Flame,
    Pause,
    Play,
    RotateCcw,
    SkipForward,
    Zap,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusStore } from "../store/useFocusStore";
import { useHabitStore } from "../store/useHabitStore";
import { useTaskStore } from "../store/useTaskStore";
import { StripedBackground } from "./StripedBackground";

export const PomodoroTimer: React.FC = () => {
  const {
    status,
    secondsLeft,
    settings,
    sessionCount,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipToBreak,
    tickSecond,
    sessions,
  } = useFocusStore();
  const { addFocusMinutes } = useTaskStore();
  const { getTotalXP } = useHabitStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => tickSecond(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, tickSecond]);

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "running" && status === "break") {
      addFocusMinutes(settings.focusMinutes);
    }
    prevStatus.current = status;
  }, [status, settings.focusMinutes, addFocusMinutes]);

  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () =>
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    updateTime();
    const t = setInterval(updateTime, 60000);
    return () => clearInterval(t);
  }, []);

  const totalSeconds =
    status === "break"
      ? (sessionCount % settings.sessionsBeforeLong === 0
          ? settings.longBreak
          : settings.shortBreak) * 60
      : settings.focusMinutes * 60; // Horizontal bar progress
  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds));
  const progressPct = `${(progress * 100).toFixed(1)}%` as any;

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const secondsStr = (secondsLeft % 60).toString().padStart(2, "0");

  const isRest = status === "break";
  const ringColor = isRest ? "#E2E4E9" : "#4FE179"; // Exoplan Style Theme (White for break, Green for focus)
  const isRunning = status === "running";

  const todayMinutes = sessions
    .filter(
      (s) =>
        s.startedAt.startsWith(new Date().toISOString().split("T")[0]) &&
        s.type === "focus",
    )
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const todaySessions = sessions.filter((s) =>
    s.startedAt.startsWith(new Date().toISOString().split("T")[0]),
  );

  const todayLogs = todaySessions.length;

  return (
    <View style={styles.widgetCard}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <StripedBackground opacity={0.05} />
      </View>

      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View
            style={[
              styles.iconCircle,
              isRest ? styles.iconCircleRest : styles.iconCircleFocus,
            ]}
          >
            {isRest ? (
              <Clock size={20} color="#E2E4E9" />
            ) : (
              <Brain size={20} color="#4FE179" />
            )}
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.widgetTitle}>
              {isRest ? "Rest Phase" : "Focus Phase"}
            </Text>
            <View style={styles.streakRow}>
              {isRest ? (
                <Clock size={12} color="#E2E4E9" />
              ) : (
                <Flame size={12} color="#FFD700" />
              )}
              <Text style={styles.streakText}>
                Session {Math.max(sessionCount, 1)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrackBg} />
        <View
          style={[
            styles.progressFill,
            { width: progressPct, backgroundColor: ringColor },
          ]}
        />
        <View
          style={[
            styles.progressCap,
            { backgroundColor: ringColor, left: progressPct },
          ]}
        />
      </View>

      <View style={styles.midRow}>
        <View style={styles.numbersBox}>
          <Text
            style={styles.hugeNumber}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {minutes}
          </Text>
          <View style={styles.smallNumberBox}>
            <Text style={styles.colonText}>:{secondsStr}</Text>
            <Text style={styles.minsLeft}>min left</Text>
          </View>
        </View>

        <View style={styles.controlsSide}>
          <Pressable style={styles.smallBtn} onPress={resetTimer}>
            <RotateCcw size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <Pressable
            style={[
              styles.playBtn,
              {
                backgroundColor: isRunning
                  ? "rgba(255,255,255,0.1)"
                  : ringColor,
              },
            ]}
            onPress={isRunning ? pauseTimer : () => resumeTimer()}
          >
            {isRunning ? (
              <Pause size={20} color="#fff" fill="#fff" />
            ) : (
              <Play size={20} color="#000" fill="#000" />
            )}
          </Pressable>
          <Pressable style={styles.smallBtn} onPress={skipToBreak}>
            <SkipForward size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomStatsCard}>
        <View style={styles.statCol}>
          <Activity size={12} color="rgba(255,255,255,0.4)" />
          <Text style={styles.statVal}>{todayLogs}</Text>
          <Text style={styles.statLabel}>Logs</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Clock size={12} color="rgba(255,255,255,0.4)" />
          <Text style={styles.statVal}>{todayMinutes}</Text>
          <Text style={styles.statLabel}>Mins</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Zap size={12} color="rgba(255,255,255,0.4)" />
          <Text style={styles.statVal}>{getTotalXP()}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  widgetCard: {
    backgroundColor: "#1A221F", // Exoplan Dark Green from index.tsx
    borderRadius: 24,
    padding: 20,
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#2B3530", // Exoplan Border Highlight
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconCircleFocus: {
    backgroundColor: "rgba(79,225,121,0.1)",
    borderColor: "rgba(79,225,121,0.3)",
  },
  iconCircleRest: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  titleBlock: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  timeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
    paddingTop: 4,
  },
  progressContainer: {
    width: "100%",
    height: 24, // Thinner, sharper progress track
    marginBottom: 20,
    position: "relative",
    justifyContent: "center",
  },
  progressTrackBg: {
    position: "absolute",
    width: "100%",
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  progressFill: {
    position: "absolute",
    height: 16,
    borderRadius: 8,
    left: 0,
    minWidth: 16,
  },
  progressCap: {
    position: "absolute",
    width: 4,
    height: 22,
    borderRadius: 2,
    marginLeft: -2,
  },
  midRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  numbersBox: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
  },
  hugeNumber: {
    fontSize: 46,
    fontWeight: "700",
    letterSpacing: -1,
    color: "#ffffff",
  },
  smallNumberBox: {
    marginLeft: 4,
    marginBottom: 6,
    flexDirection: "column",
  },
  colonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  minsLeft: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  controlsSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Tighter gap
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 16, // Squarish to match Exoplan style
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  smallBtn: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  bottomStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111614", // Darker indent
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  statCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6, // Prevents text crowding
  },
  statVal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 8,
  },
});
