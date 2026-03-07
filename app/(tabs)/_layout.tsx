// NeuroTask — Tab Layout (Exoplan style)
// Clean dark tab bar with green accent on active tab
// PageHeader is rendered HERE so it stays fixed during tab transitions.

import { Tabs, usePathname } from "expo-router";
import {
    BarChart3,
    CalendarDays,
    CheckSquare,
    Flame,
    Timer,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageHeader } from "../../src/components/PageHeader";
import { WeekStripHeader } from "../../src/components/WeekStripHeader";
import { Colors, Spacing } from "../../src/constants/theme";

// Map route segments to display titles
const ROUTE_TITLES: Record<string, string> = {
  "/": "Schedule",
  "": "Schedule",
  "/tasks": "Tasks",
  "/habits": "Habits",
  "/focus": "Focus",
  "/stats": "Stats",
};

export default function TabLayout() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Derive the title from the current pathname
  const title = useMemo(() => {
    return ROUTE_TITLES[pathname] || "Schedule";
  }, [pathname]);

  return (
    <View style={styles.root}>
      {/* ── Tab Navigator — fills entire screen, gradients go edge-to-edge ── */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
          tabBarStyle: { display: "none" },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            letterSpacing: 0.2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Schedule",
            tabBarIcon: ({ color, focused }) => (
              <CalendarDays
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            tabBarIcon: ({ color, focused }) => (
              <CheckSquare
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: "Habits",
            tabBarIcon: ({ color, focused }) => (
              <Flame
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="focus"
          options={{
            title: "Focus",
            tabBarIcon: ({ color, focused }) => (
              <Timer
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, focused }) => (
              <BarChart3
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            ),
          }}
        />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      {/* ── Persistent Header — floats above tab content, transparent bg ── */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}
        pointerEvents="box-none"
      >
        <PageHeader title={title}>
          {(pathname === "/" || pathname === "") && <WeekStripHeader />}
        </PageHeader>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
});
