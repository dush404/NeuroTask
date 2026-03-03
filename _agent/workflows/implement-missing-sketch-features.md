---
description: Implement missing features identified from the hand-drawn sketch vs. current NeuroTask app
---

# Workflow: Implement Missing Sketch Features

Based on the gap analysis (sketch_gap_analysis.md), these are the missing/partial features to implement in priority order.

---

## Phase 1 — HIGH PRIORITY (Core UX Gaps)

### Step 1 — Wire swipe-to-complete in Tasks screen

Replace the inline `Pressable`-based `renderTaskCard` in `app/(tabs)/tasks.tsx` with the existing `TaskCard` component (from `src/components/TaskCard.tsx`) that already has swipe-right-to-complete and swipe-left-to-delete gestures.

**Files to change:**

- `app/(tabs)/tasks.tsx` — remove `renderTaskCard` inline function, import `TaskCard`, render it in `FlatList.renderItem`

**Verify:** Run `npx expo start` → go to Tasks tab → swipe a task right to complete it, left to delete it.

---

### Step 2 — Task Detail Bottom Sheet

When a task card is tapped, open a modal bottom-sheet showing:

- Editable title (`TextInput`)
- Editable due date (quick-chip date picker already in add modal)
- Priority selector (already in add modal)
- Subtasks list (editable — add, tick, delete individual subtasks)
- Notes / description field
- Delete button

**Files to create:**

- `src/components/TaskDetailSheet.tsx` — new bottom sheet component

**Files to change:**

- `app/(tabs)/tasks.tsx` — on task card press, open `TaskDetailSheet` with the selected task
- `src/store/useTaskStore.ts` — add `updateSubtask`, `addSubtask`, `removeSubtask` actions if missing

**Verify:** Run `npx expo start` → tap a task card → bottom sheet slides up → edit title → tap Save → confirm title updated in list.

---

## Phase 2 — MEDIUM PRIORITY (Feature Completeness)

### Step 3 — Task Type Field

Add a `taskType` field to the `Task` type to support different card rendering modes.

**Files to change:**

- `src/types/task.ts` — add `taskType?: 'normal' | 'toGo' | 'withSubtask'`
- `app/(tabs)/tasks.tsx` → `TaskDetailSheet.tsx` — show task type selector when adding/editing
- `src/components/TaskCard.tsx` — branch rendering: `withSubtask` shows inline subtask rows; `toGo` shows from→to location chips

**Verify:** Add a task, set type to "With Subtaskt" → card renders subtask rows. Set type to "To Go" → card shows location fields.

---

### Step 4 — Habit Detail Tabs (stroke / level / complete)

When a habit card is expanded, show 3 tabs:

- **Stroke** (streak history heatmap — already exists, just move here)
- **Level** (XP progress ring + level milestones)
- **Complete** (full log list: date + completed boolean)

**Files to change:**

- `app/(tabs)/habits.tsx` — replace the `isExpanded` heatmap section with a `HabitDetailTabs` component
- `src/components/HabitDetailTabs.tsx` — new component with tab bar + 3 tab panels

**Verify:** Run app → Habits tab → tap a habit card → tabs appear → swipe between Stroke / Level / Complete tabs.

---

### Step 5 — Habit Time Target (timer per habit)

Each habit should have an optional `targetMinutes` (e.g., "Read for 30 min"). Habits with a target show a timer button in the card that starts the Focus timer for that duration.

**Files to change:**

- `src/types/task.ts` — add `targetMinutes?: number` to `Habit` interface
- `app/(tabs)/habits.tsx` — add `targetMinutes` field to the add-habit modal (hour/minute picker wheels or simple number input)
- `src/components/HabitCard.tsx` (or inline in habits.tsx) — show a ▶ timer button if `targetMinutes` is set; on press, navigate to Focus tab and start a custom-duration timer
- `src/store/useFocusStore.ts` — add `startCustomTimer(minutes: number)` action

**Verify:** Add a habit with target 20 min → timer button appears → tap → Focus tab opens with 20:00 countdown started.

---

### Step 6 — "Slots" Section in Habits

A "Slots" is a time-blocked habit session (e.g., "Morning Routine 07:00–07:30"). Add a Slots card below the habits list.

**Files to create:**

- `src/components/HabitSlotCard.tsx` — displays a slot with: colour dot, icon, habit name, time range, start-timer button

**Files to change:**

- `src/types/task.ts` — add `HabitSlot` interface `{ id, habitId, startTime: string, durationMinutes: number, colour: string, icon: string }`
- `src/store/useHabitStore.ts` — add `slots: HabitSlot[]`, `addSlot`, `removeSlot`
- `app/(tabs)/habits.tsx` — add "Slots" section header below habits list, render `HabitSlotCard` list + FAB for adding slots; the add-slot modal has: time picker (HH:MM), duration (hour/min), colour, icon

**Verify:** Run app → Habits tab → scroll down → Slots section visible → tap + → fill form → slot card appears with correct time and colour.

---

## Phase 3 — LOW PRIORITY (Polish)

### Step 7 — Per-task Mini Completion Ring

Add a small circular progress ring to `TaskCard.tsx` that shows subtask completion ratio (already tracked as a progress bar — just replace/augment with `ProgressRing`).

**Files to change:**

- `src/components/TaskCard.tsx` — replace `progressTrack`/`progressFill` with `<ProgressRing>` at small size (24px)

**Verify:** Add a task with 2 subtasks → complete 1 → ring shows 50% filled.

---

### Step 8 — Timeline on Tasks / Home Screen

Show a vertical timeline for the day (similar to `TimelineBlock` already in focus.tsx) on the Tasks screen, filtered to tasks with `dueTime` set. The timeline should show the current-time indicator.

**Files to change:**

- `app/(tabs)/tasks.tsx` — add a "Today Timeline" collapsible section above the task list when `activeSubCategory === 'today'`
- Reuse `TimelineBlock.tsx` with tasks sorted by `dueTime`

**Verify:** Add task with dueTime set → switch to "Today" sub-category → Timeline section appears with task at correct time slot.

---

## Notes

- Run `npx expo start --clear` to reset the Metro cache between steps if you see stale module errors.
- All new store actions should use `AsyncStorage` (via `zustand/middleware` `persist`) — check existing patterns in `src/store/useTaskStore.ts`.
- Keep Expo Go compatible: no native modules, use `expo-*` packages only.
