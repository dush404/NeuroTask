import React from "react";
import { SharedValue } from "react-native-reanimated";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardVariant =
  | "default"
  | "teal"
  | "green"
  | "compact"
  | "outlined"
  | "purple"
  | "orange"
  | "pink"
  | "red";

export type LineStyle =
  | "straight-muted"
  | "straight-active"
  | "curve-right"
  | "curve-left"
  | "fade-out"
  | "none";

export interface TimelineTask {
  id: string;
  title: string;
  subtitle?: string;
  timeStr: string;
  status: "todo" | "in_progress" | "done";
  variant?: CardVariant;
  rightEmoji?: React.ReactNode;
  leftCategoryIcon?: React.ReactNode;
  bufferText?: string; // If present, renders buffer zone *above* this block
  lineStyle?: LineStyle;
  nodeState?: "active" | "muted" | "none";
  durationMinutes?: number;
  isEmptyHour?: boolean;
  isCurrentHour?: boolean;
  currentMinute?: number;
  currentMinuteOffset?: number;
  priority?: number;
  endTimeStr?: string;
  subtasks?: { id: string; title: string; completed?: boolean }[];
  taskType?: string; // e.g. "normal", "toGo", "withSubtask", "project", "manual"
  fromLocation?: string;
  toLocation?: string;
  startDateStr?: string; // used for Project / To Go
  travelMode?: string;

  // ── NEW: Overlap handling ──
  overlapIndex?: number; // Column index (0-based) when tasks overlap
  totalOverlaps?: number; // Total number of columns in this overlap group

  // ── NEW: Past task dimming ──
  isPast?: boolean; // True if task's end time is before current time

  // ── NEW: Smart gap auto-fill ──
  isGapSlot?: boolean; // True for AI auto-fill gap slots
  gapStartMinute?: number; // Absolute start minute of the gap
  gapEndMinute?: number; // Absolute end minute of the gap

  // ── NEW: "Next task" badge for current time indicator ──
  nextTaskLabel?: string; // e.g. "15m until Meeting"

  // ── NEW: Absolute position for drag-and-drop ──
  startMinuteOfDay?: number; // Absolute minute of day (0-1439)

  // ── NEW: End of day marker ──
  isEndOfDay?: boolean;
  endOfDayQuote?: string;
}

export interface TimelineBlockProps {
  task: TimelineTask;
  onPress?: () => void;
  onSwipeComplete?: (id: string) => void;
  onAIFillGap?: (startMinute: number, endMinute: number) => void;
  onReschedule?: (taskId: string, newDueTime: string) => void;
  onDurationChange?: (taskId: string, newMinutes: number) => void;
  zoomScale?: SharedValue<number>;
}
