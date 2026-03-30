import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";
import { StripedBackground } from "./StripedBackground";

export interface SwipeOption {
  value: any;
  label: string;
  color?: string;
  dotColor?: string;
  icon?: React.ReactNode;
}

interface SwipeSelectorProps {
  options: SwipeOption[];
  value: any;
  onChange: (value: any) => void;
  width: number;
  activeColor?: string;
}

export const SwipeSelector: React.FC<SwipeSelectorProps> = ({
  options,
  value,
  onChange,
  width,
  activeColor,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const initialIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  // Update state whenever the user swipes to a new option
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      onChange(viewableItems[0].item.value);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View
      style={[
        styles.container,
        { width },
        activeColor && { borderColor: `${activeColor}40` },
      ]}
    >
      {activeColor && <StripedBackground color={activeColor} opacity={0.04} />}
      <FlatList
        ref={flatListRef}
        data={options}
        keyExtractor={(item) => item.value.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <View style={[styles.item, { width }]}>
            {index > 0 && (
              <ChevronLeft
                size={16}
                color={Colors.textMuted}
                style={styles.leftIcon}
              />
            )}

            {item.icon && <View style={styles.iconWrapper}>{item.icon}</View>}

            {item.dotColor && (
              <View style={[styles.dot, { backgroundColor: item.dotColor }]} />
            )}

            <Text
              style={[
                styles.label,
                { color: item.color || Colors.textPrimary },
              ]}
            >
              {item.label}
            </Text>

            {index < options.length - 1 && (
              <ChevronRight
                size={16}
                color={Colors.textMuted}
                style={styles.rightIcon}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  item: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  leftIcon: { position: "absolute", left: 12 },
  rightIcon: { position: "absolute", right: 12 },
  label: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
  iconWrapper: { marginRight: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
