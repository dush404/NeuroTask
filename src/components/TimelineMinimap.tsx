// NeuroTask — TimelineMinimap ("Time Travel" Scrub Bar)
// Fixed 8px vertical bar on the right edge showing proportional task blocks.
// Drag to fast-scrub through the day.

import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";
import { themes } from "../styles/timeline.styles";
import { TimelineTask } from "../types/timeline";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINIMAP_WIDTH = 8;
const MINIMAP_TOP = 120; // offset from top of screen
const MINIMAP_BOTTOM = 140; // offset from bottom of screen
const MINIMAP_HEIGHT = SCREEN_HEIGHT - MINIMAP_TOP - MINIMAP_BOTTOM;
const MINUTES_IN_DAY = 1440;

interface TimelineMinimapProps {
  timelineTasks: TimelineTask[];
  nowMinutes: number;
  isToday: boolean;
  scrollRef: React.RefObject<any>;
  totalScrollHeight: number; // total content height of the timeline ScrollView
  scrollOffset: SharedValue<number>; // current scroll Y position
}

export const TimelineMinimap: React.FC<TimelineMinimapProps> = ({
  timelineTasks,
  nowMinutes,
  isToday,
  scrollRef,
  totalScrollHeight,
  scrollOffset,
}) => {
  // Compute task blocks with their proportional positions
  const taskBlocks = useMemo(() => {
    return timelineTasks
      .filter(
        (t) =>
          !t.isEmptyHour &&
          !t.isGapSlot &&
          t.startMinuteOfDay !== undefined &&
          t.title,
      )
      .map((t) => {
        const start = t.startMinuteOfDay!;
        const duration = t.durationMinutes || 30;
        const variant = t.variant ?? "default";
        const theme = themes[variant];

        return {
          id: t.id,
          topPct: start / MINUTES_IN_DAY,
          heightPct: Math.max(duration / MINUTES_IN_DAY, 0.008), // min 0.8% so it's visible
          color: theme.border || "rgba(255,255,255,0.2)",
        };
      });
  }, [timelineTasks]);

  // Current-time indicator position
  const nowPct = isToday ? nowMinutes / MINUTES_IN_DAY : -1;

  // Scroll position indicator
  const indicatorStyle = useAnimatedStyle(() => {
    if (totalScrollHeight <= 0) return { top: 0 };
    const viewportRatio = SCREEN_HEIGHT / totalScrollHeight;
    const topPct = scrollOffset.value / totalScrollHeight;
    return {
      top: topPct * MINIMAP_HEIGHT,
      height: Math.max(viewportRatio * MINIMAP_HEIGHT, 6),
    };
  });

  // Pan gesture: scrub through the day
  const doScroll = React.useCallback(
    (y: number) => {
      if (!scrollRef || !scrollRef.current || totalScrollHeight <= 0) return;
      const pct = Math.max(0, Math.min(1, y / MINIMAP_HEIGHT));
      const scrollY = pct * totalScrollHeight;
      scrollRef.current.scrollTo({ y: scrollY, animated: false });
    },
    [scrollRef, totalScrollHeight],
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          doScroll(e.y);
        })
        .onEnd((e) => {
          doScroll(e.y);
        })
        .runOnJS(true),
    [doScroll],
  );

  // Tap gesture: jump to position
  const tapGesture = React.useMemo(
    () =>
      Gesture.Tap()
        .onEnd((e) => {
          doScroll(e.y);
        })
        .runOnJS(true),
    [doScroll],
  );

  const composedGesture = React.useMemo(
    () => Gesture.Race(panGesture, tapGesture),
    [panGesture, tapGesture],
  );

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={mapStyles.container}>
        {/* Track background */}
        <View style={mapStyles.track} />

        {/* Task blocks */}
        {taskBlocks.map((block) => (
          <View
            key={block.id}
            style={[
              mapStyles.taskBlock,
              {
                top: block.topPct * MINIMAP_HEIGHT,
                height: Math.max(block.heightPct * MINIMAP_HEIGHT, 2),
                backgroundColor: block.color,
              },
            ]}
          />
        ))}

        {/* Current time indicator (red line) */}
        {nowPct >= 0 && (
          <View
            style={[
              mapStyles.currentTimeLine,
              { top: nowPct * MINIMAP_HEIGHT },
            ]}
          />
        )}

        {/* Viewport scroll indicator */}
        <Animated.View style={[mapStyles.viewportIndicator, indicatorStyle]} />
      </Animated.View>
    </GestureDetector>
  );
};

const mapStyles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 4,
    top: MINIMAP_TOP,
    width: MINIMAP_WIDTH,
    height: MINIMAP_HEIGHT,
    zIndex: 100,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 4,
  },
  taskBlock: {
    position: "absolute",
    left: 0,
    width: MINIMAP_WIDTH,
    borderRadius: 2,
    opacity: 0.7,
  },
  currentTimeLine: {
    position: "absolute",
    left: -2,
    width: MINIMAP_WIDTH + 4,
    height: 2,
    backgroundColor: "#EF4444",
    borderRadius: 1,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  viewportIndicator: {
    position: "absolute",
    left: -1,
    width: MINIMAP_WIDTH + 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
