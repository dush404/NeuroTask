import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";

const ITEM_HEIGHT = 38; // Compact item height
const VISIBLE_ITEMS = 5; // 5 visible to keep the nice "wheel" look
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const padEmpty = (arr: any[]) => [
  { id: "e1", val: null },
  { id: "e2", val: null },
  ...arr.map((val, i) => ({ id: i.toString(), val })),
  { id: "e3", val: null },
  { id: "e4", val: null },
];

/* ── Inline Time Picker ─────────────────────────────────────────────────── */
const hoursData = Array.from({ length: 24 }, (_, i) => i);
const minsData = Array.from({ length: 60 }, (_, i) => i);
const paddedHours = padEmpty(hoursData);
const paddedMins = padEmpty(minsData);

export const InlineTimePicker = ({
  time,
  onChange,
  accentColor = Colors.textPrimary,
}: {
  time: string;
  onChange: (time: string) => void;
  accentColor?: string;
}) => {
  const initDate = new Date();
  const initH =
    time && !isNaN(parseInt(time.split(":")[0]))
      ? parseInt(time.split(":")[0])
      : initDate.getHours();
  const initM =
    time && !isNaN(parseInt(time.split(":")[1]))
      ? parseInt(time.split(":")[1])
      : initDate.getMinutes();

  const [hours, setHours] = useState(initH);
  const [minutes, setMinutes] = useState(initM);

  const hourListRef = useRef<ScrollView>(null);
  const minListRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      hourListRef.current?.scrollTo({
        y: hours * ITEM_HEIGHT,
        animated: false,
      });
      minListRef.current?.scrollTo({
        y: minutes * ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
  }, []);

  const handleScroll = (
    type: "h" | "m",
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);

    if (type === "h") {
      if (index >= 0 && index < 24) {
        setHours(index);
        onChange(`${index.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
      }
    } else {
      if (index >= 0 && index < 60) {
        setMinutes(index);
        onChange(`${hours.toString().padStart(2, "0")}:${index.toString().padStart(2, "0")}`);
      }
    }
  };

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.selectionHighlight} pointerEvents="none" />
      
      <View style={[styles.wheelWrapper, { width: 70 }]}>
        <ScrollView
          ref={hourListRef}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => handleScroll("h", e)}
        >
          {paddedHours.map((item) => {
            const isValid = item.val !== null;
            const isSelected = item.val === hours;
            return (
              <View key={`h-${item.id}`} style={styles.item}>
                <Text
                  style={[
                    styles.itemText,
                    !isValid && { opacity: 0 },
                    isSelected && [styles.itemTextSelected, { color: accentColor }],
                  ]}
                >
                  {isValid ? item.val.toString().padStart(2, "0") : ""}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      
      <Text style={[styles.colon, { color: accentColor }]}>:</Text>
      
      <View style={[styles.wheelWrapper, { width: 70 }]}>
        <ScrollView
          ref={minListRef}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => handleScroll("m", e)}
        >
          {paddedMins.map((item) => {
            const isValid = item.val !== null;
            const isSelected = item.val === minutes;
            return (
              <View key={`m-${item.id}`} style={styles.item}>
                <Text
                  style={[
                    styles.itemText,
                    !isValid && { opacity: 0 },
                    isSelected && [styles.itemTextSelected, { color: accentColor }],
                  ]}
                >
                  {isValid ? item.val.toString().padStart(2, "0") : ""}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

/* ── Inline Date Picker ─────────────────────────────────────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const InlineDatePicker = ({
  dateIso,
  onChange,
  accentColor = Colors.textPrimary,
}: {
  dateIso: string;
  onChange: (iso: string) => void;
  accentColor?: string;
}) => {
  const initDate = dateIso ? new Date(dateIso) : new Date();

  const [day, setDay] = useState(initDate.getDate());
  const [month, setMonth] = useState(initDate.getMonth());
  const [year, setYear] = useState(initDate.getFullYear());

  const dayListRef = useRef<ScrollView>(null);
  const monthListRef = useRef<ScrollView>(null);
  const yearListRef = useRef<ScrollView>(null);

  const maxDays = new Date(year, month + 1, 0).getDate();
  const daysData = Array.from({ length: maxDays }, (_, i) => i + 1);
  const paddedDays = padEmpty(daysData);

  const paddedMonths = padEmpty(MONTHS);

  const currentYear = new Date().getFullYear();
  const yearsData = Array.from({ length: 10 }, (_, i) => currentYear - 1 + i);
  const paddedYears = padEmpty(yearsData);

  useEffect(() => {
    setTimeout(() => {
      dayListRef.current?.scrollTo({
        y: (day - 1) * ITEM_HEIGHT,
        animated: false,
      });
      monthListRef.current?.scrollTo({
        y: month * ITEM_HEIGHT,
        animated: false,
      });

      const yIndex = yearsData.indexOf(year);
      if (yIndex !== -1) {
        yearListRef.current?.scrollTo({
          y: yIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
    }, 50);
  }, []); // Only scroll once on mount

  const emitChange = (d: number, m: number, y: number) => {
    const validDay = Math.min(d, new Date(y, m + 1, 0).getDate());
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
    onChange(iso);
  };

  const handleScroll = (
    type: "d" | "m" | "y",
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);

    if (type === "d") {
      if (index >= 0 && index < daysData.length) {
        const newDay = daysData[index];
        setDay(newDay);
        emitChange(newDay, month, year);
      }
    } else if (type === "m") {
      if (index >= 0 && index < 12) {
        setMonth(index);
        emitChange(day, index, year);
      }
    } else if (type === "y") {
      if (index >= 0 && index < yearsData.length) {
        const newYear = yearsData[index];
        setYear(newYear);
        emitChange(day, month, newYear);
      }
    }
  };

  const renderList = (
    ref: React.RefObject<ScrollView | null>,
    data: any[],
    type: "d" | "m" | "y",
    selectedValue: any,
    width: number,
  ) => (
    <View style={[styles.wheelWrapper, { width }]}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => handleScroll(type, e)}
      >
        {data.map((item) => {
          const isValid = item.val !== null;
          const isSelected = item.val === selectedValue;
          return (
            <View key={`${type}-${item.id}`} style={styles.item}>
              <Text
                style={[
                  styles.itemText,
                  !isValid && { opacity: 0 },
                  isSelected && [styles.itemTextSelected, { color: accentColor }],
                ]}
              >
                {isValid
                  ? type === "d"
                    ? item.val.toString().padStart(2, "0")
                    : item.val
                  : ""}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.selectionHighlight} pointerEvents="none" />
      {renderList(dayListRef, paddedDays, "d", day, 60)}
      {renderList(monthListRef, paddedMonths, "m", MONTHS[month], 80)}
      {renderList(yearListRef, paddedYears, "y", year, 80)}
    </View>
  );
};

const styles = StyleSheet.create({
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: VISIBLE_ITEMS * ITEM_HEIGHT,
    position: "relative",
    paddingVertical: 10,
  },
  selectionHighlight: {
    position: "absolute",
    top: 2 * ITEM_HEIGHT + 10,
    height: ITEM_HEIGHT,
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  wheelWrapper: { height: "100%" },
  colon: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 12,
    opacity: 0.9,
  },
  item: { height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
  itemText: {
    fontSize: 17,
    color: Colors.textSecondary,
    fontWeight: "500",
    opacity: 0.35,
  },
  itemTextSelected: {
    fontSize: 24,
    fontWeight: "800",
    opacity: 1,
  },
});
