import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import * as NavigationBar from "expo-navigation-bar";

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

function AppContent() {
    useEffect(() => {
        // Hide Android navigation bar for immersive experience
        const setupNavigationBar = async () => {
            try {
                await NavigationBar.setVisibilityAsync("hidden");
                await NavigationBar.setBehaviorAsync("inset-swipe");
            } catch (error) {
                console.log("Navigation bar setup error:", error);
            }
        };

        setupNavigationBar();
    }, []);

    return (
        <>
            <AppNavigator />
            <StatusBar style="auto" />
        </>
    );
}