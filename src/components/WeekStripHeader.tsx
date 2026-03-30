import { addDays, format, isSameDay, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTaskStore } from "../store/useTaskStore";
import { indexStyles as styles } from "../styles/index.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 42;

export function WeekStripHeader() {
  const scheduleDateStr = useTaskStore((s) => s.scheduleDate);
  const setScheduleDate = useTaskStore((s) => s.setScheduleDate);

  const [listWidth, setListWidth] = useState(SCREEN_WIDTH - 140);
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);
  const lastHapticIndex = useRef(-1);

  // Generate a broad range of dates: 365 days past to 365 days future
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 731 }).map((_, i) => addDays(today, i - 365));
  }, []);

  const initialIndex = useMemo(() => {
    const target = scheduleDateStr ? parseISO(scheduleDateStr) : new Date();
    const idx = dates.findIndex((d) => isSameDay(d, target));
    return idx !== -1 ? idx : 365;
  }, []); // Only compute once on mount so initialScrollIndex is stable

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isScrolling.current) return;
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);

    // Add light haptic feedback when crossing a day threshold
    if (
      index !== lastHapticIndex.current &&
      index >= 0 &&
      index < dates.length
    ) {
      lastHapticIndex.current = index;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const commitSelection = (x: number) => {
    const index = Math.round(x / ITEM_WIDTH);
    if (index >= 0 && index < dates.length) {
      const selected = dates[index];
      const selectedStr = format(selected, "yyyy-MM-dd");
      if (selectedStr !== scheduleDateStr) {
        setScheduleDate(selectedStr);
      }
    }
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    isScrolling.current = false;
    commitSelection(e.nativeEvent.contentOffset.x);
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocity = e.nativeEvent.velocity?.x ?? 0;
    if (Math.abs(velocity) < 0.1) {
      isScrolling.current = false;
      commitSelection(e.nativeEvent.contentOffset.x);
    }
  };

  // Sync scroll position if scheduleDate changes from outside
  useEffect(() => {
    if (!isScrolling.current && flatListRef.current) {
      const idx = dates.findIndex((d) =>
        isSameDay(
          d,
          parseISO(scheduleDateStr || format(new Date(), "yyyy-MM-dd")),
        ),
      );
      if (idx !== -1) {
        flatListRef.current.scrollToOffset({
          offset: idx * ITEM_WIDTH,
          animated: true,
        });
        lastHapticIndex.current = idx;
      }
    }
  }, [scheduleDateStr, dates]);

  return (
    <View
      style={localStyles.container}
      onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        ref={flatListRef}
        data={dates}
        extraData={scheduleDateStr}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isScrolling.current = true;
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        contentContainerStyle={{
          paddingHorizontal: Math.max(0, (listWidth - ITEM_WIDTH) / 2),
        }}
        keyExtractor={(item) => format(item, "yyyy-MM-dd")}
        renderItem={({ item }) => {
          const date = item;
          const dayLabel = format(date, "EEEEE"); // "M", "T"
          const num = format(date, "d");
          const isActive = isSameDay(
            date,
            scheduleDateStr ? parseISO(scheduleDateStr) : new Date(),
          );
          const isToday = isSameDay(date, new Date());

          return (
            <TouchableOpacity
              style={[
                styles.dayBox,
                {
                  width: ITEM_WIDTH,
                  height: 40,
                  justifyContent: "center",
                  paddingBottom: 2,
                },
              ]}
              onPress={() => {
                isScrolling.current = false;
                const selectedStr = format(date, "yyyy-MM-dd");
                setScheduleDate(selectedStr);
              }}
              activeOpacity={0.7}
            >
              {isToday && <View style={styles.redDot} />}
              <Text
                style={[styles.dayLabel, isActive && styles.dayLabelActive]}
              >
                {dayLabel}
              </Text>
              <Text style={[styles.dayNum, isActive && styles.dayNumActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Fixed Center Selector Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          marginLeft: -12, // Half of the 24px width to perfectly center it
          width: 24,
          height: 2,
          borderRadius: 1,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
        pointerEvents="none"
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
});
