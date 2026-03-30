import { LinearGradient } from "expo-linear-gradient";
import { Brain, Clock, Hourglass } from "lucide-react-native";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PomodoroTimer } from "../../src/components/PomodoroTimer";
import { TimelineBlock } from "../../src/components/TimelineBlock";
import { useFocusStore } from "../../src/store/useFocusStore";
import { focusStyles as styles } from "../../src/styles/focus.styles";

export default function FocusScreen() {
  const { sessions } = useFocusStore();

  const todaySessions = useMemo(
    () =>
      sessions.filter((s) =>
        s.startedAt.startsWith(new Date().toISOString().split("T")[0]),
      ),
    [sessions],
  );

  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 20) + 60; // Exact match to habits page top spacing
  const pb = Platform.OS === "ios" ? 120 : 100;

  return (
    <View style={styles.safe}>
      {/* Background to match the app theme, classic glassy black gradient */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#0D1F13", "#061009", "#000000"]}
          style={{ flex: 1 }}
        />
      </View>

      {/* ── Top Foreground Mask for Smooth Scroll Fade ── */}
      <LinearGradient
        colors={["#0D1F13", "#0D1F13", "#0D1F1300"]}
        locations={[0, 0.7, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight + 20,
          zIndex: 5,
        }}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + 20, paddingBottom: pb },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* The New iOS-styled Pomodoro Widget */}
        <View style={styles.widgetWrapper}>
          <PomodoroTimer />
        </View>

        {/* Session History Container */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Focus Logs</Text>
          <Text style={styles.sectionCount}>
            {todaySessions.length} activity
          </Text>
        </View>

        <View style={{ marginLeft: -16 }}>
          {/* To offset timeline left margin so it aligns nicely */}
          {todaySessions.length > 0 ? (
            todaySessions.slice(0, 5).map((s, idx) => (
              <TimelineBlock
                key={s.id}
                task={{
                  id: s.id,
                  title:
                    s.type === "focus" ? "Deep Flow Session" : "Rest Phase",
                  subtitle: `${s.durationMinutes} minutes recorded`,
                  timeStr: new Date(s.startedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                  status: "done",
                  variant: s.type === "focus" ? "default" : "compact",
                  leftCategoryIcon:
                    s.type === "focus" ? (
                      <Brain
                        size={14}
                        color="#4FE179"
                        style={{ marginRight: 2 }}
                      />
                    ) : (
                      <Clock
                        size={14}
                        color="#E2E4E9"
                        style={{ marginRight: 2 }}
                      />
                    ),
                  lineStyle:
                    idx === Math.min(todaySessions.length, 5) - 1
                      ? "fade-out"
                      : "straight-muted",
                  nodeState: "muted",
                  bufferText: idx === 0 ? "Daily session records" : undefined,
                }}
              />
            ))
          ) : (
            <View style={[styles.emptyCard, { marginLeft: 16 }]}>
              <Hourglass
                size={36}
                color="#E2E4E9"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyTitle}>Awaiting first session</Text>
              <Text style={styles.emptyBody}>
                Tap play on the widget above to start tracking your focus phases
                and earn XP.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
