// NeuroTask — Shared Page Header Component
// Consistent header with menu button, navigation, and task completion ring.
// Used across all tab pages (excluding AI chat).

import { Menu } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import { Colors } from "../constants/theme";
import { useTaskStore } from "../store/useTaskStore";
import { TopNavItems } from "./TopNavItems";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

// ── Completion Ring ───────────────────────────────────────────────────────────

const CompletionRing = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => {
  const size = 44;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background track */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress arc */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4CAF50"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center count */}
      <View style={StyleSheet.absoluteFill}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={styles.ringText}>{completed}</Text>
        </View>
      </View>
    </View>
  );
};

// ── Page Header ───────────────────────────────────────────────────────────────

export const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  const { tasks } = useTaskStore();
  const [showNav, setShowNav] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const completedToday = useMemo(
    () => tasks.filter((t) => t.completedAt?.startsWith(todayStr)).length,
    [tasks, todayStr],
  );
  const totalActive = useMemo(
    () => tasks.filter((t) => t.status !== "done").length,
    [tasks],
  );

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          onPress={() => setShowNav(!showNav)}
          style={styles.menuBtn}
          activeOpacity={0.8}
        >
          <Menu size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        {showNav ? (
          <TopNavItems />
        ) : children ? (
          <View style={{ flex: 1 }}>{children}</View>
        ) : (
          <Text style={styles.headerTitle}>{title}</Text>
        )}
      </View>
      <CompletionRing
        completed={completedToday}
        total={completedToday + totalActive}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  ringText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "800",
  },
});
