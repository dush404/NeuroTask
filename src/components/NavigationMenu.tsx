import { router, usePathname } from "expo-router";
import {
    BarChart3,
    CalendarDays,
    CheckSquare,
    Flame,
    Timer,
    X,
} from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography } from "../constants/theme";

interface NavigationMenuProps {
  visible: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { name: "Schedule", path: "/(tabs)", exactPath: "/", icon: CalendarDays },
  { name: "Tasks", path: "/(tabs)/tasks", icon: CheckSquare },
  { name: "Habits", path: "/(tabs)/habits", icon: Flame },
  { name: "Focus", path: "/(tabs)/focus", icon: Timer },
  { name: "Stats", path: "/(tabs)/stats", icon: BarChart3 },
];

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  visible,
  onClose,
}) => {
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    onClose();
    // small delay allows modal exit animation to start
    setTimeout(() => {
      router.replace(path as any);
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Click outside to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Slide out panel (left side) */}
        <SafeAreaView style={styles.panel} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Text style={styles.appTitle}>NeuroTask</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.menuLinks}>
            {MENU_ITEMS.map((item, index) => {
              // check active roughly by pathname
              const isActive =
                item.exactPath === "/"
                  ? pathname === "/" || pathname === ""
                  : pathname.startsWith(item.path.replace("/(tabs)", "")); // handle expo-router nested paths quirk

              const Icon = item.icon;

              return (
                <Pressable
                  key={index}
                  style={[styles.linkRow, isActive && styles.linkRowActive]}
                  onPress={() => handleNavigate(item.path)}
                  android_ripple={{ color: "rgba(255,255,255,0.05)" }}
                >
                  <Icon
                    size={22}
                    color={isActive ? Colors.accent : Colors.textSecondary}
                  />
                  <Text
                    style={[styles.linkText, isActive && styles.linkTextActive]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
  },
  panel: {
    width: "75%",
    maxWidth: 320,
    backgroundColor: "#111513",
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
  },
  appTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  menuLinks: {
    paddingHorizontal: 16,
    gap: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  linkRowActive: {
    backgroundColor: "rgba(76,175,80,0.1)",
  },
  linkText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: "500",
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  linkTextActive: {
    color: Colors.accent,
    fontWeight: "700",
  },
});
