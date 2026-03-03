import { router, usePathname } from "expo-router";
import {
    BarChart3,
    BrainCircuit,
    CalendarDays,
    CheckSquare,
    Flame,
    Timer,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/theme";

const MENU_ITEMS = [
  {
    name: "Schedule",
    path: "/(tabs)",
    exactPath: "/",
    icon: CalendarDays,
    color: "#5BA4E5",
  }, // Blue
  { name: "Tasks", path: "/(tabs)/tasks", icon: CheckSquare, color: "#9D72FF" }, // Purple
  { name: "Habits", path: "/(tabs)/habits", icon: Flame, color: "#FFB443" }, // Gold
  { name: "Focus", path: "/(tabs)/focus", icon: Timer, color: "#4FE179" }, // Green
  { name: "Stats", path: "/(tabs)/stats", icon: BarChart3, color: "#FF6B35" }, // Orange/Red
  { name: "AI", path: "/ai-chat", icon: BrainCircuit, color: "#4ECDC4" }, // Cyan
];

export const TopNavItems = () => {
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    // Determine the right routing method based on if it's a modal/push or top-level tab
    if (path.startsWith("/ai-chat")) {
      router.push(path as any);
    } else {
      router.replace(path as any);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MENU_ITEMS.map((item, index) => {
          const isActive =
            item.exactPath === "/"
              ? pathname === "/" || pathname === ""
              : pathname.startsWith(item.path.replace("/(tabs)", ""));

          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.navBtn,
                isActive && { backgroundColor: `${item.color}25` },
              ]}
              onPress={() => handleNavigate(item.path)}
              activeOpacity={0.7}
            >
              <Icon
                size={14}
                color={isActive ? item.color : Colors.textSecondary}
              />
              <Text style={[styles.navText, isActive && { color: item.color }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    marginHorizontal: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 4,
  },
  navText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
});
