import { Play } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";

// ─── Constants ───────────────────────────────────────────────────────────────
const ITEM_H = 40; // height of every cell
const VISIBLE = 5; // odd number — centre cell is the selection
const HALF = 2; // (VISIBLE - 1) / 2  → padding on each side
const PICKER_H = ITEM_H * VISIBLE;

// ─── Shared WheelColumn ──────────────────────────────────────────────────────
interface WheelColumnProps {
  data: string[]; // all option labels (already formatted)
  selectedIndex: number;
  onSelect: (index: number) => void;
  width: number;
  accentColor: string;
}

const WheelColumn: React.FC<WheelColumnProps> = ({
  data,
  selectedIndex,
  onSelect,
  width,
  accentColor,
}) => {
  // Animated value tracks the raw contentOffset.y ─ used for per-item interpolation
  const scrollY = useRef(new Animated.Value(selectedIndex * ITEM_H)).current;
  // We keep a plain ref alongside so JS callbacks can read the latest value synchronously
  const scrollYRaw = useRef(selectedIndex * ITEM_H);
  const scrollRef = useRef<ScrollView>(null);
  const settling = useRef(false); // guard against double-fire

  // ── Initial scroll position ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_H,
        animated: false,
      });
    }, 40);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Force-snap to the nearest valid index ───────────────────────────────
  const snapToNearest = useCallback(
    (rawY: number) => {
      if (settling.current) return;
      settling.current = true;

      const clamped = Math.max(
        0,
        Math.min(data.length - 1, Math.round(rawY / ITEM_H)),
      );
      const targetY = clamped * ITEM_H;

      // Programmatically lock to the exact slot
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
      onSelect(clamped);

      // Release the guard after the animated scroll finishes (~150 ms)
      setTimeout(() => {
        settling.current = false;
      }, 200);
    },
    [data.length, onSelect],
  );

  // ── Scroll event — drives Animated interpolations via native driver ──────
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollYRaw.current = e.nativeEvent.contentOffset.y;
      },
    },
  );

  // ── Fired when inertia ends (fast fling) ────────────────────────────────
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  // ── Fired when finger lifts (slow drag — the missing case before) ───────
  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const vy = e.nativeEvent.velocity?.y ?? 0;
    // Only force-snap here if there is negligible velocity; otherwise let
    // onMomentumScrollEnd take over to avoid fighting each other.
    if (Math.abs(vy) < 0.3) {
      snapToNearest(e.nativeEvent.contentOffset.y);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.columnOuter, { width }]}>
      {/* @ts-ignore — Animated.ScrollView ref works fine at runtime */}
      <Animated.ScrollView
        ref={scrollRef as any}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled
        bounces={false}
        contentContainerStyle={{ paddingVertical: HALF * ITEM_H }}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
      >
        {data.map((label, idx) => {
          // ── Native-driver animated style per item ─────────────────────
          // When scrollY === idx * ITEM_H, this item is centred.
          const itemScrollPos = idx * ITEM_H;

          const opacity = scrollY.interpolate({
            inputRange: [
              itemScrollPos - 2 * ITEM_H,
              itemScrollPos - ITEM_H,
              itemScrollPos,
              itemScrollPos + ITEM_H,
              itemScrollPos + 2 * ITEM_H,
            ],
            outputRange: [0.12, 0.36, 1, 0.36, 0.12],
            extrapolate: "clamp",
          });

          const scale = scrollY.interpolate({
            inputRange: [
              itemScrollPos - 2 * ITEM_H,
              itemScrollPos - ITEM_H,
              itemScrollPos,
              itemScrollPos + ITEM_H,
              itemScrollPos + 2 * ITEM_H,
            ],
            outputRange: [0.72, 0.86, 1, 0.86, 0.72],
            extrapolate: "clamp",
          });

          const isSelected = idx === selectedIndex;

          return (
            <Animated.View
              key={`${idx}`}
              style={[styles.item, { opacity, transform: [{ scale }] }]}
            >
              <Text
                style={[
                  styles.itemText,
                  isSelected && [
                    styles.itemTextSelected,
                    { color: accentColor },
                  ],
                ]}
              >
                {label}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

// ─── Inline Time Picker ───────────────────────────────────────────────────────
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MIN_LABELS = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

export const InlineTimePicker = ({
  time,
  onChange,
  accentColor = Colors.textPrimary,
}: {
  time: string;
  onChange: (time: string) => void;
  accentColor?: string;
}) => {
  const now = new Date();
  const initH =
    time && !isNaN(+time.split(":")[0]) ? +time.split(":")[0] : now.getHours();
  const initM =
    time && !isNaN(+time.split(":")[1])
      ? +time.split(":")[1]
      : now.getMinutes();

  const [hours, setHours] = useState(initH);
  const [minutes, setMinutes] = useState(initM);

  // Keep refs so we can build the new time string without stale closures
  const hoursRef = useRef(initH);
  const minutesRef = useRef(initM);

  const onSelectHour = useCallback(
    (idx: number) => {
      hoursRef.current = idx;
      setHours(idx);
      onChange(
        `${idx.toString().padStart(2, "0")}:${minutesRef.current.toString().padStart(2, "0")}`,
      );
    },
    [onChange],
  );

  const onSelectMinute = useCallback(
    (idx: number) => {
      minutesRef.current = idx;
      setMinutes(idx);
      onChange(
        `${hoursRef.current.toString().padStart(2, "0")}:${idx.toString().padStart(2, "0")}`,
      );
    },
    [onChange],
  );

  return (
    <View style={styles.wheelContainer}>
      {/* Centred glass highlight band */}
      <View style={styles.selectionHighlight} pointerEvents="none">
        <Play size={14} color={accentColor} fill={accentColor} />
      </View>

      <WheelColumn
        data={HOUR_LABELS}
        selectedIndex={hours}
        onSelect={onSelectHour}
        width={72}
        accentColor={accentColor}
      />

      <Text style={[styles.colon, { color: accentColor }]}>:</Text>

      <WheelColumn
        data={MIN_LABELS}
        selectedIndex={minutes}
        onSelect={onSelectMinute}
        width={72}
        accentColor={accentColor}
      />
    </View>
  );
};

// ─── Inline Date Picker ───────────────────────────────────────────────────────
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const InlineDatePicker = ({
  dateIso,
  onChange,
  accentColor = Colors.textPrimary,
}: {
  dateIso: string;
  onChange: (iso: string) => void;
  accentColor?: string;
}) => {
  const init = dateIso ? new Date(dateIso) : new Date();

  const [day, setDay] = useState(init.getDate()); // 1-indexed
  const [month, setMonth] = useState(init.getMonth()); // 0-indexed
  const [year, setYear] = useState(init.getFullYear());

  // Refs to read latest values inside callbacks without stale closures
  const dayRef = useRef(init.getDate());
  const monthRef = useRef(init.getMonth());
  const yearRef = useRef(init.getFullYear());

  const curYear = new Date().getFullYear();
  const YEAR_LABELS = Array.from({ length: 10 }, (_, i) =>
    String(curYear - 1 + i),
  );

  // Day labels are rebuilt when month/year changes so the count is correct
  const maxDays = new Date(year, month + 1, 0).getDate();
  const DAY_LABELS = Array.from({ length: maxDays }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  const emit = (d: number, m: number, y: number) => {
    const validD = Math.min(d, new Date(y, m + 1, 0).getDate());
    onChange(
      `${y}-${String(m + 1).padStart(2, "0")}-${String(validD).padStart(2, "0")}`,
    );
  };

  const onSelectDay = useCallback(
    (idx: number) => {
      const d = idx + 1; // convert 0-index → actual day number
      dayRef.current = d;
      setDay(d);
      emit(d, monthRef.current, yearRef.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onSelectMonth = useCallback(
    (idx: number) => {
      monthRef.current = idx;
      setMonth(idx);
      emit(dayRef.current, idx, yearRef.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onSelectYear = useCallback(
    (idx: number) => {
      const y = curYear - 1 + idx;
      yearRef.current = y;
      setYear(y);
      emit(dayRef.current, monthRef.current, y);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [curYear],
  );

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.selectionHighlight} pointerEvents="none">
        <Play size={14} color={accentColor} fill={accentColor} />
      </View>

      {/* Day — 0-indexed: day 1 = index 0 */}
      <WheelColumn
        key={`day-${maxDays}`} // remount when month changes so max day count updates
        data={DAY_LABELS}
        selectedIndex={Math.min(day - 1, maxDays - 1)}
        onSelect={onSelectDay}
        width={58}
        accentColor={accentColor}
      />

      {/* Month */}
      <View style={styles.sep} />
      <WheelColumn
        data={MONTH_LABELS}
        selectedIndex={month}
        onSelect={onSelectMonth}
        width={72}
        accentColor={accentColor}
      />

      {/* Year */}
      <View style={styles.sep} />
      <WheelColumn
        data={YEAR_LABELS}
        selectedIndex={Math.max(0, year - (curYear - 1))}
        onSelect={onSelectYear}
        width={72}
        accentColor={accentColor}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: PICKER_H,
    position: "relative",
    paddingVertical: 8,
  },

  // Frosted glass band behind the centre (selected) row
  selectionHighlight: {
    position: "absolute",
    top: HALF * ITEM_H, // Exactly mathematically centered
    height: ITEM_H,
    left: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  columnOuter: {
    height: PICKER_H,
    overflow: "hidden",
  },

  sep: {
    width: 1,
    height: ITEM_H * 0.55,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 6,
  },

  colon: {
    fontSize: 22,
    fontWeight: "800",
    marginHorizontal: 10,
    opacity: 0.9,
    lineHeight: ITEM_H,
  },

  item: {
    height: ITEM_H,
    justifyContent: "center",
    alignItems: "center",
  },

  itemText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
    opacity: 0.9, // additional opacity baked in (the Animated opacity handles the fade)
  },

  itemTextSelected: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});
