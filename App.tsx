import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { Auth0Provider } from "./src/contexts/Auth0Context";
import AppNavigator from "./src/navigation/AppNavigator";
import * as NavigationBar from "expo-navigation-bar";

export default function App() {
    return (
        <SafeAreaProvider>
            <Auth0Provider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </Auth0Provider>
        </SafeAreaProvider>
    );
}

function AppContent() {
    useEffect(() => {
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