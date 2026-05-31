// NeuroTask — Tab Layout
// Global: floating header, custom tab bar with flanking FABs,
//         and a globally-managed ScheduleTaskSheet.

import { router, Tabs, usePathname } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomTabBar } from "../../src/components/CustomTabBar";
import { PageHeader } from "../../src/components/PageHeader";
import { ScheduleTaskSheet } from "../../src/components/ScheduleTaskSheet";
import { WeekStripHeader } from "../../src/components/WeekStripHeader";
import { Spacing } from "../../src/constants/theme";
import { useTaskStore } from "../../src/store/useTaskStore";
import type { Task } from "../../src/types/task";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Schedule",
  "": "Schedule",
  "/tasks": "Tasks",
  "/habits": "Habits",
  "/focus": "Focus",
  "/stats": "Stats",
};

export default function TabLayout() {
  const pathname  = usePathname();
  const insets    = useSafeAreaInsets();
  const title     = useMemo(() => ROUTE_TITLES[pathname] || "Schedule", [pathname]);

  const {
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    scheduleDate,
  } = useTaskStore();

  const [sheetTask, setSheetTask] = useState<Task | null>(null);

  // Global "add task" used by the left FAB
  const handleGlobalAddTask = () => {
    const today = scheduleDate || new Date().toISOString().split("T")[0];
    const now   = new Date();
    const hh    = String(now.getHours()).padStart(2, "0");
    const mm    = String(now.getMinutes()).padStart(2, "0");
    const newTask: Task = {
      id:               `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title:            "",
      priority:         4,
      status:           "todo",
      listId:           "inbox",
      tags:             [],
      dueDate:          today,
      dueTime:          `${hh}:${mm}`,
      createdAt:        new Date().toISOString(),
      subtasks:         [],
      comments:         [],
      sortOrder:        Date.now(),
      estimatedMinutes: 30,
    };
    addTask(newTask);
    setSheetTask(newTask);
  };

  const handleSheetClose = () => {
    if (sheetTask) {
      const latest = useTaskStore.getState().tasks.find((t) => t.id === sheetTask.id);
      if (latest && !latest.title.trim() && latest.createdAt === sheetTask.createdAt) {
        deleteTask(sheetTask.id);
      }
    }
    setSheetTask(null);
  };

  return (
    <View style={styles.root}>
      {/* ── Screens ── */}
      <Tabs
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onAddTask={handleGlobalAddTask}
            onAIPress={() => router.push("/ai-chat")}
          />
        )}
        screenOptions={{
          headerShown:  false,
          tabBarStyle:  { display: "none" },
        }}
      >
        <Tabs.Screen name="index"   options={{ title: "Schedule" }} />
        <Tabs.Screen name="tasks"   options={{ title: "Tasks" }} />
        <Tabs.Screen name="habits"  options={{ title: "Habits" }} />
        <Tabs.Screen name="focus"   options={{ title: "Focus" }} />
        <Tabs.Screen name="stats"   options={{ title: "Stats" }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      {/* ── Persistent floating header ── */}
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}
        pointerEvents="box-none"
      >
        <PageHeader title={title}>
          {(pathname === "/" || pathname === "") && <WeekStripHeader />}
        </PageHeader>
      </View>

      {/* ── Global task creation sheet (triggered by left FAB) ── */}
      <ScheduleTaskSheet
        task={sheetTask}
        visible={!!sheetTask}
        onClose={handleSheetClose}
        onUpdate={updateTask}
        onAddSubtask={(taskId, subtask) =>
          addSubtask(taskId, {
            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ...subtask,
          })
        }
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={removeSubtask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
});
