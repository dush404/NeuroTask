// NeuroTask — Weekly Bar Chart Component
// Simple SVG-based 7-day task completion bar chart.

import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { Colors } from "../constants/theme";

interface WeeklyGraphProps {
  data: number[]; // 7 values, Mon-Sun
  maxValue?: number;
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CHART_HEIGHT = 80;
const BAR_WIDTH = 28;
const GAP = 8;
const CHART_WIDTH = (BAR_WIDTH + GAP) * 7;

export const WeeklyGraph: React.FC<WeeklyGraphProps> = ({ data, maxValue }) => {
  const max = maxValue ?? Math.max(...data, 1);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 20}>
        {data.map((val, i) => {
          const barH = Math.max((val / max) * CHART_HEIGHT, 4);
          const x = i * (BAR_WIDTH + GAP);
          const y = CHART_HEIGHT - barH;
          const isToday = i === 6;
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barH}
                rx={5}
                ry={5}
                fill={isToday ? Colors.accent : "rgba(58,141,255,0.3)"}
              />
              <SvgText
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 14}
                fontSize={10}
                fill={Colors.textMuted}
                textAnchor="middle"
              >
                {DAYS[i]}
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
