import { addDays, format, isSameDay, parseISO } from "date-fns";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTaskStore } from "../store/useTaskStore";
import { indexStyles as styles } from "../styles/index.styles";

export function WeekStripHeader() {
  const scheduleDateStr = useTaskStore((s) => s.scheduleDate);
  const setScheduleDate = useTaskStore((s) => s.setScheduleDate);

  // Fallback to today if not set somehow
  const selectedDate = scheduleDateStr ? parseISO(scheduleDateStr) : new Date();

  // Generate 7 days around selected date (3 before, 3 after)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      return addDays(selectedDate, i - 3);
    });
  }, [selectedDate]);

  return (
    <View style={localStyles.container}>
      {weekDays.map((date, i) => {
        const dayLabel = format(date, "EEEEE"); // e.g. "M", "T", "W"
        const num = format(date, "d");
        const isActive = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());

        return (
          <TouchableOpacity
            key={i}
            style={styles.dayBox}
            onPress={() => setScheduleDate(format(date, "yyyy-MM-dd"))}
            activeOpacity={0.7}
          >
            {/* Red dot indicator for actual today */}
            {isToday && <View style={styles.redDot} />}

            <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
              {dayLabel}
            </Text>
            <Text style={[styles.dayNum, isActive && styles.dayNumActive]}>
              {num}
            </Text>

            {/* Underline for active selection */}
            {isActive && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 8,
  },
});
