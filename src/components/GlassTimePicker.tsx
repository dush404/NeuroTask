import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors, Radius } from "../constants/theme";

interface GlassTimePickerProps {
  visible: boolean;
  initialTime: string; // "HH:mm"
  title?: string;
  onClose: () => void;
  onSelect: (time: string) => void;
}

const ITEM_HEIGHT = 54;
const VISIBLE_ITEMS = 5;

export function GlassTimePicker({
  visible,
  initialTime,
  title,
  onClose,
  onSelect,
}: GlassTimePickerProps) {
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);

  const hourListRef = useRef<FlatList>(null);
  const minListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && initialTime) {
      const h = parseInt(initialTime.split(":")[0], 10);
      const m = parseInt(initialTime.split(":")[1], 10);
      setHours(isNaN(h) ? 9 : h);
      setMinutes(isNaN(m) ? 0 : m);
    }
  }, [visible, initialTime]);

  // Data sets padded for centering
  const padEmpty = (arr: number[]) => [-2, -1, ...arr, -3, -4];
  const hoursData = padEmpty(Array.from({ length: 24 }, (_, i) => i));
  const minsData = padEmpty(Array.from({ length: 60 }, (_, i) => i));

  const handleScroll = (
    type: "h" | "m",
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (type === "h") {
      if (index >= 0 && index < 24) setHours(index);
    } else {
      if (index >= 0 && index < 60) setMinutes(index);
    }
  };

  useEffect(() => {
    if (visible && hourListRef.current && minListRef.current) {
      setTimeout(() => {
        hourListRef.current?.scrollToOffset({
          offset: hours * ITEM_HEIGHT,
          animated: false,
        });
        minListRef.current?.scrollToOffset({
          offset: minutes * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [visible]); // Removed hours/minutes to only fire on mount/open

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </BlurView>

      <View style={styles.bottomContainer} pointerEvents="box-none">
        <BlurView intensity={60} tint="dark" style={styles.pickerBox}>
          {title && <Text style={styles.title}>{title}</Text>}

          <View style={styles.wheelContainer}>
            {/* Selection Highlight */}
            <View style={styles.selectionHighlight} />

            {/* Hours Wheel */}
            <View style={styles.wheelWrapper}>
              <FlatList
                ref={hourListRef}
                data={hoursData}
                keyExtractor={(_, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => handleScroll("h", e)}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                renderItem={({ item }) => {
                  const isValid = item >= 0;
                  const isSelected = item === hours;
                  return (
                    <View style={styles.item}>
                      <Text
                        style={[
                          styles.itemText,
                          !isValid && { opacity: 0 },
                          isSelected && styles.itemTextSelected,
                        ]}
                      >
                        {isValid ? item.toString().padStart(2, "0") : ""}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>

            <Text style={styles.colon}>:</Text>

            {/* Minutes Wheel */}
            <View style={styles.wheelWrapper}>
              <FlatList
                ref={minListRef}
                data={minsData}
                keyExtractor={(_, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => handleScroll("m", e)}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                renderItem={({ item }) => {
                  const isValid = item >= 0;
                  const isSelected = item === minutes;
                  return (
                    <View style={styles.item}>
                      <Text
                        style={[
                          styles.itemText,
                          !isValid && { opacity: 0 },
                          isSelected && styles.itemTextSelected,
                        ]}
                      >
                        {isValid ? item.toString().padStart(2, "0") : ""}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.confirmBtn}
              onPress={() => {
                onSelect(
                  `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}`,
                );
              }}
            >
              <Text style={styles.confirmText}>Set Time</Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerBox: {
    width: "100%",
    padding: 24,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(10,15,20,0.55)", // Dark glass tint
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden", // Prevents blur from spilling outside borders
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: VISIBLE_ITEMS * ITEM_HEIGHT,
    position: "relative",
    marginBottom: 8,
  },
  selectionHighlight: {
    position: "absolute",
    top: 2 * ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  wheelWrapper: {
    width: 80,
    height: "100%",
  },
  colon: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.accent,
    marginHorizontal: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: "500",
    opacity: 0.4,
  },
  itemTextSelected: {
    fontSize: 32,
    color: Colors.textPrimary,
    fontWeight: "bold",
    opacity: 1,
    textShadowColor: "rgba(255,255,255,0.2)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  footer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cancelText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "bold",
  },
});
