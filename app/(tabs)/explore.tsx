// This file is intentionally unused.
// The Expo template's "explore" tab has been replaced by the NeuroTask "tasks" tab.
// Expo Router requires this file to exist if previously referenced; it now redirects.
import { Redirect } from "expo-router";
export default function ExploreRedirect() {
  return <Redirect href="/(tabs)/tasks" />;
}
