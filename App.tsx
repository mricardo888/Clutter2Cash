import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import * as NavigationBar from "expo-navigation-bar";

export default function App() {
  useEffect(() => {
    // Hide Android navigation bar
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBackgroundColorAsync("#ffffff"); // optional: set background
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
