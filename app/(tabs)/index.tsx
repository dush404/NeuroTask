// NeuroTask — Dashboard UI Exact Match (Exoplan Style)
// Static UI recreation matching reference image down to the pixel

import { LinearGradient } from "expo-linear-gradient";
import {
    Activity,
    Briefcase,
    Coffee,
    Dumbbell as DumbbellIcon,
    HeartPulse,
    ListTodo,
    Plus,
    Sparkles,
    Utensils,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    Gesture,
    GestureDetector,
    ScrollView,
} from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

// PageHeader is now rendered in (tabs)/_layout.tsx for persistence
import { ScheduleTaskSheet } from "../../src/components/ScheduleTaskSheet";
import {
    CardVariant,
    TimelineBlock,
    TimelineTask,
} from "../../src/components/TimelineBlock";
import { useTaskStore } from "../../src/store/useTaskStore";
import { indexStyles as styles } from "../../src/styles/index.styles";
import { Task } from "../../src/types/task";

// ── Icons ──────────────────────────────────────────────────────────────────────

// Subcomponents representing custom aesthetic icons for specific timeline tasks

const ArrowDL = ({ color }: { color: string }) => (
  <Text
    style={{
      color,
      fontSize: 13,
      fontWeight: "bold",
      marginLeft: -4,
      marginTop: -2,
    }}
  >
    ↙
  </Text>
);

const ArrowDR = ({ color }: { color: string }) => (
  <Text
    style={{
      color,
      fontSize: 13,
      fontWeight: "bold",
      marginLeft: -4,
      marginTop: -2,
    }}
  >
    ↘
  </Text>
);

const RunIcon = () => <Activity size={14} color="#E2E4E9" />;

const ForkKnife = () => <Utensils size={14} color="#77A6B6" />;

const Dumbbell = () => <DumbbellIcon size={14} color="#8EAC8E" />;

const CheckCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="#fff" />
    <Path
      d="M8 12.5l3 3 5-6"
      stroke="#1D2024"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Exact Reference Data ───────────────────────────────────────────────────────

const EXACT_DEMO_SLOTS: TimelineTask[] = [
  {
    id: "t0",
    title: "", // Empty block just for the 3 PM label in the screenshot
    timeStr: "3 PM",
    status: "todo",
    lineStyle: "straight-muted",
    nodeState: "muted",
    bufferText: "Buffer & rest zone",
    leftCategoryIcon: <ArrowDL color="#688463" />, // Greenish arrow
    variant: "outlined",
  },
  {
    id: "t1",
    title: "UI Demo",
    timeStr: "3:30",
    status: "todo",
    variant: "default",
    lineStyle: "straight-muted",
    nodeState: "muted",
    bufferText: "Buffer & rest zone",
    leftCategoryIcon: <ArrowDL color="#D4A73D" />, // Orange arrow
  },
  {
    id: "t2",
    title: "Pre workout lunch",
    timeStr: "4 PM",
    status: "todo",
    variant: "teal",
    rightEmoji: <ForkKnife />,
    lineStyle: "straight-muted",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t3",
    title: "Daily Standup",
    timeStr: "5 PM",
    status: "todo",
    variant: "default",
    lineStyle: "straight-muted",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t4",
    title: "Resistance Training",
    subtitle: "↪ Commute included",
    timeStr: "6 PM",
    status: "todo",
    variant: "green",
    rightEmoji: <Dumbbell />,
    leftCategoryIcon: <RunIcon />,
    lineStyle: "curve-right",
    nodeState: "active",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t5",
    title: "Book flight tickets",
    timeStr: "8 PM",
    status: "done",
    variant: "teal",
    rightEmoji: <CheckCircleIcon />,
    leftCategoryIcon: <ArrowDR color="#55B66A" />,
    lineStyle: "curve-left",
    nodeState: "active",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t6",
    title: "Order protein",
    timeStr: "",
    status: "todo",
    variant: "compact",
    rightEmoji: (
      <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
        Tap to complete
      </Text>
    ),
    lineStyle: "straight-active",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t7",
    title: "Order vitamin D",
    timeStr: "9 PM",
    status: "done",
    variant: "compact",
    rightEmoji: (
      <Text style={{ color: "#E2E4E9", fontSize: 10 }}>✓ Completed</Text>
    ),
    lineStyle: "straight-active",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t8",
    title: "Exoplan Discussion",
    timeStr: "10 PM",
    status: "todo",
    variant: "outlined",
    lineStyle: "straight-active",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t9",
    title: "Update table",
    timeStr: "10:15",
    status: "todo",
    variant: "default",
    leftCategoryIcon: <ArrowDL color="#D4A73D" />,
    lineStyle: "fade-out",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
];

const MINUTES_PER_DAY = 1440;

function getMinuteOfDay(time?: string) {
  if (!time) return null;
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return hour * 60 + minute;
}

function getIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getVariantForCategory(categoryId?: string): CardVariant {
  switch (categoryId) {
    case "work":
      return "teal";
    case "personal":
      return "purple";
    case "health":
      return "green";
    case "errands":
      return "orange";
    case "ideas":
      return "pink";
    case "wishlist":
      return "red";
    default:
      return "default";
  }
}

function getIconForCategory(categoryId?: string) {
  const size = 14;
  switch (categoryId) {
    case "work":
      return <Briefcase size={size} color="#A9D9EB" />;
    case "health":
      return <HeartPulse size={size} color="#CCF4D0" />;
    case "errands":
      return <Activity size={size} color="#FFEDD5" />;
    case "ideas":
    case "wishlist":
      return <Coffee size={size} color="#FCE7F3" />;
    default:
      return <ListTodo size={size} color="#E2E4E9" />;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardExact() {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 20) + 60;

  const scrollRef = useRef<any>(null);
  const baseScale = useSharedValue(1);
  const pinchScale = useSharedValue(1);

  const MAX_SCALE = 100 / 50; // Enforces a maximum card size of exactly 100px for standard 54px blocks

  const zoomScale = useDerivedValue(() => {
    return Math.max(
      0.1,
      Math.min(MAX_SCALE, baseScale.value * pinchScale.value),
    );
  });

  const pinchGesture = Gesture.Pinch()
    .simultaneousWithExternalGesture(scrollRef)
    .onUpdate((e) => {
      pinchScale.value = e.scale;
    })
    .onEnd(() => {
      baseScale.value = Math.max(
        0.1,
        Math.min(MAX_SCALE, baseScale.value * pinchScale.value),
      );
      pinchScale.value = 1;
    });

  const {
    tasks,
    addTask,
    deleteTask,
    updateTask,
    addSubtask,
    removeSubtask,
    scheduleDate,
  } = useTaskStore();

  const [sheetTask, setSheetTask] = useState<Task | null>(null);

  // ── Live clock: auto-updates every minute so the red line moves ──
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    };
    // Sync to the start of the next minute for precision
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msUntilNextMinute);
    return () => {
      clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleCreateTask = () => {
    const now = new Date();
    const isToday = scheduleDate === getIsoDate(now);
    const defaultMinute = isToday
      ? Math.min(
          now.getHours() * 60 + now.getMinutes() + 1,
          MINUTES_PER_DAY - 1,
        )
      : 12 * 60;
    const defaultDueTime = `${String(Math.floor(defaultMinute / 60)).padStart(
      2,
      "0",
    )}:${String(defaultMinute % 60).padStart(2, "0")}`;

    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      title: "",
      priority: 4,
      status: "todo",
      listId: "inbox",
      tags: [],
      dueDate: scheduleDate,
      dueTime: defaultDueTime,
      createdAt: new Date().toISOString(),
      subtasks: [],
      comments: [],
      sortOrder: 0,
      estimatedMinutes: 30, // Default to 30min block
    };
    addTask(newTask);
    setSheetTask(newTask);
  };

  // Filter tasks for selected date
  const todaysTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate === scheduleDate)
      .sort((a, b) =>
        (a.dueTime || "23:59").localeCompare(b.dueTime || "23:59"),
      );
  }, [tasks, scheduleDate]);

  const isScheduleToday = scheduleDate === getIsoDate(new Date());

  const timelineTasks: TimelineTask[] = useMemo(() => {
    const mixedTasks: TimelineTask[] = [];
    const tasksByHour = new Map<number, Task[]>();
    const currentHour = Math.floor(nowMinutes / 60);
    const currentMinute = nowMinutes % 60;

    todaysTasks.forEach((task) => {
      const startMinute = getMinuteOfDay(task.dueTime);
      if (startMinute === null) return;

      const hour = Math.floor(startMinute / 60);
      if (!tasksByHour.has(hour)) tasksByHour.set(hour, []);
      tasksByHour.get(hour)!.push(task);
    });

    for (let hour = 0; hour < 24; hour++) {
      const tasksInHour = (tasksByHour.get(hour) || []).sort((a, b) =>
        (a.dueTime || "23:59").localeCompare(b.dueTime || "23:59"),
      );
      const firstTaskMinute =
        tasksInHour.length > 0
          ? (getMinuteOfDay(tasksInHour[0].dueTime) ?? hour * 60) % 60
          : null;
      const hostTask =
        isScheduleToday && hour === currentHour
          ? ([...tasksInHour].reverse().find((task) => {
              const taskMinute = (getMinuteOfDay(task.dueTime) ?? 0) % 60;
              return taskMinute <= currentMinute;
            }) ?? null)
          : null;
      const showHourAnchor =
        tasksInHour.length === 0 ||
        (tasksInHour[0].dueTime || "").slice(3, 5) !== "00";

      if (showHourAnchor) {
        const ampm = hour < 12 ? "AM" : "PM";
        const hourLabel = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        mixedTasks.push({
          id: `empty-hr-${hour}`,
          title: "",
          timeStr: `${hourLabel} ${ampm}`,
          status: "todo",
          isEmptyHour: true,
          lineStyle: "straight-muted",
          nodeState:
            isScheduleToday && hour === currentHour && !hostTask
              ? "active"
              : "muted",
          isCurrentHour: isScheduleToday && hour === currentHour && !hostTask,
          currentMinute:
            isScheduleToday &&
            hour === currentHour &&
            (!firstTaskMinute || currentMinute < firstTaskMinute)
              ? currentMinute
              : undefined,
          currentMinuteOffset:
            isScheduleToday &&
            hour === currentHour &&
            (!firstTaskMinute || currentMinute < firstTaskMinute)
              ? currentMinute
              : undefined,
        });
      }

      tasksInHour.forEach((task, index) => {
        const startMinute = getMinuteOfDay(task.dueTime) ?? hour * 60;
        const minuteInHour = startMinute % 60;
        const taskHour = Math.floor(startMinute / 60);
        const ampm = taskHour < 12 ? "AM" : "PM";
        const hourLabel =
          taskHour === 0 ? 12 : taskHour > 12 ? taskHour - 12 : taskHour;
        const minuteLabel = String(minuteInHour).padStart(2, "0");
        const isCurrentHost = hostTask?.id === task.id;

        mixedTasks.push({
          id: task.id,
          title: task.title,
          subtitle:
            task.notes ||
            (task.taskType === "toGo" && task.toLocation
              ? `To: ${task.toLocation}`
              : undefined),
          timeStr:
            minuteLabel === "00"
              ? `${hourLabel} ${ampm}`
              : `${hourLabel}:${minuteLabel} ${ampm}`,
          status: task.status === "done" ? "done" : "todo",
          variant: getVariantForCategory(task.listId),
          durationMinutes: task.estimatedMinutes || 30,
          leftCategoryIcon: getIconForCategory(task.listId),
          lineStyle:
            task.status === "done" ? "straight-active" : "straight-muted",
          nodeState: task.status === "done" ? "muted" : "active",
          isCurrentHour: isCurrentHost,
          currentMinute: isCurrentHost ? currentMinute : undefined,
          currentMinuteOffset: isCurrentHost
            ? Math.max(0, currentMinute - minuteInHour)
            : undefined,
          priority:
            typeof task.priority === "number" ? task.priority : undefined,
          endTimeStr:
            task.dueTime && task.estimatedMinutes
              ? (() => {
                  const [h, m] = task.dueTime.split(":").map(Number);
                  if (isNaN(h) || isNaN(m)) return undefined;
                  const endMins = h * 60 + m + task.estimatedMinutes;
                  const eh = Math.floor(endMins / 60) % 24;
                  const em = endMins % 60;
                  const eAmpm = eh < 12 ? "AM" : "PM";
                  const eHourLabel = eh === 0 ? 12 : eh > 12 ? eh - 12 : eh;
                  const eMinLabel = em.toString().padStart(2, "0");
                  return `${eHourLabel}:${eMinLabel} ${eAmpm}`;
                })()
              : undefined,
          subtasks: task.subtasks,
        });

        if (
          isScheduleToday &&
          hour === currentHour &&
          index === tasksInHour.length - 1 &&
          currentMinute > minuteInHour &&
          hostTask?.id === task.id
        ) {
          mixedTasks[mixedTasks.length - 1].currentMinuteOffset =
            currentMinute - minuteInHour;
        }
      });
    }

    if (mixedTasks.length > 0) {
      mixedTasks[mixedTasks.length - 1].lineStyle = "fade-out";
    }

    return mixedTasks;
  }, [todaysTasks, isScheduleToday, nowMinutes]);

  // Swipe completion handler
  const handleSwipeComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === "done" ? "todo" : "done" });
    }
  };

  const handleOpenSheet = (id: string) => {
    const t = tasks.find((t) => t.id === id);
    if (t) setSheetTask(t);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtask = task.subtasks?.find((s) => s.id === subtaskId);
    if (!subtask) return;

    // Remove old, add updated (quick state manipulation before triggering store)
    removeSubtask(taskId, subtaskId);
    addSubtask(taskId, { ...subtask, completed: !subtask.completed });
  };

  return (
    <View style={styles.root}>
      {/* ── Day Header Band (Green Gradient) like the screenshot ── */}
      {/* Set to pointerEvents="none" so clicks pass through to components underneath */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#0D1B2A", "#050A11", "#000000"]}
          style={{ height: 280 }}
          start={[0.5, 0]}
          end={[0.5, 1]}
        />
      </View>

      <View
        style={[
          styles.headerArea,
          { paddingTop: headerHeight, paddingBottom: 10 },
        ]}
      />

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <GestureDetector gesture={pinchGesture}>
        <ScrollView
          ref={scrollRef}
          style={styles.timelineScroll}
          contentContainerStyle={styles.timelineContent}
          showsVerticalScrollIndicator={false}
        >
          {timelineTasks.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ color: "rgba(255,255,255,0.4)" }}>
                No tasks scheduled for this day.
              </Text>
            </View>
          ) : (
            timelineTasks.map((slot) => (
              <TimelineBlock
                key={slot.id}
                task={slot}
                onPress={() => handleOpenSheet(slot.id)}
                onSwipeComplete={handleSwipeComplete}
                zoomScale={zoomScale}
              />
            ))
          )}
          <View style={{ height: 160 }} />
        </ScrollView>
      </GestureDetector>

      {/* ── Floating Action Buttons (FABs) ───────────────────────────── */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabAI} activeOpacity={0.85}>
          <View style={styles.fabAIGlow} />
          <View style={styles.fabAIInner}>
            <Sparkles size={20} color="#E9D5FF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fabMain}
          activeOpacity={0.85}
          onPress={handleCreateTask}
        >
          <View style={styles.fabMainGlow} />
          <View style={styles.fabMainInner}>
            <Plus size={22} color="#fff" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Task Detail Sheet ────────────────────────────────────────── */}
      <ScheduleTaskSheet
        task={sheetTask}
        visible={!!sheetTask}
        onClose={() => {
          if (sheetTask) {
            const freshTasks = useTaskStore.getState().tasks;
            const latestTask = freshTasks.find((t) => t.id === sheetTask.id);
            // Delete if title is empty and it was just created
            if (
              latestTask &&
              !latestTask.title.trim() &&
              latestTask.createdAt === sheetTask.createdAt
            ) {
              deleteTask(sheetTask.id);
            }
          }
          setSheetTask(null);
        }}
        onUpdate={updateTask}
        onAddSubtask={(taskId, subtask) =>
          addSubtask(taskId, {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            ...subtask,
          })
        }
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={removeSubtask}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

/**
 * Centralized styling configuration defining the pixel-perfect layout,
 * colors, typography spacing, sizing, and positioning rules.
 */
// Styles moved to ../../src/styles/index.styles.ts
