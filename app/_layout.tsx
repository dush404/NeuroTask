import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

const ExoplanTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0D0D0D",
    card: "#1A1A1A",
    border: "rgba(255,255,255,0.07)",
    text: "#F5F5F5",
    primary: "#4CAF50",
    notification: "#4CAF50",
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={ExoplanTheme}>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" backgroundColor="#0D0D0D" />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0D0D0D" },
            // Custom screen transition config
            animation: "slide_from_right",
            animationDuration: 300,
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              // Fade for root tab transitions
              animation: "fade",
              animationDuration: 300,
            }}
          />
          <Stack.Screen
            name="ai-chat"
            options={{
              presentation: "modal",
              headerShown: false,
              animation: "slide_from_bottom",
              animationDuration: 400, // Slightly slower for modal
              gestureEnabled: true,
              gestureDirection: "vertical",
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
});
