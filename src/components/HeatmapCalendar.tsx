// NeuroTask — HeatmapCalendar Component
// 30-day habit/task heatmap using SVG colored cells.

import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { Colors } from "../constants/theme";

interface HeatmapCalendarProps {
  data: { date: string; count: number }[]; // 30 items
  color?: string;
}

const CELL = 22;
const GAP = 4;
const ROWS = 7;

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  data,
  color = Colors.accent,
}) => {
  const COLS = Math.ceil(data.length / ROWS);
  const width = COLS * (CELL + GAP);
  const height = ROWS * (CELL + GAP);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {data.map((item, i) => {
          const col = Math.floor(i / ROWS);
          const row = i % ROWS;
          const x = col * (CELL + GAP);
          const y = row * (CELL + GAP);
          const intensity = Math.min(item.count / 10, 1);
          const fillOpacity = 0.1 + intensity * 0.85;
          const dayNum = new Date(item.date).getDate();
          return (
            <React.Fragment key={item.date}>
              <Rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={5}
                ry={5}
                fill={color}
                fillOpacity={fillOpacity}
              />
              <SvgText
                x={x + CELL / 2}
                y={y + CELL / 2 + 4}
                fontSize={8}
                fill={intensity > 0.5 ? "#fff" : Colors.textMuted}
                textAnchor="middle"
              >
                {dayNum}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "flex-start" },
});
