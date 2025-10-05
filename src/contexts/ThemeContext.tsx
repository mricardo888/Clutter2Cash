import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

type ThemeMode = "light" | "dark" | "system";

interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    disabled: string;
    placeholder: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

const lightTheme: Theme = {
  mode: "light",
  colors: {
    primary: "#4CAF50",
    secondary: "#2196F3",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    card: "#FFFFFF",
    text: "#212121",
    textSecondary: "#757575",
    border: "#E0E0E0",
    accent: "#FF9800",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    disabled: "#BDBDBD",
    placeholder: "#9E9E9E",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

const darkTheme: Theme = {
  mode: "dark",
  colors: {
    primary: "#2E7D32",
    secondary: "#2196F3",
    background: "#121212",
    surface: "#1E1E1E",
    card: "#2D2D2D",
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    border: "#404040",
    accent: "#FF9800",
    success: "#2E7D32",
    warning: "#FF9800",
    error: "#F44336",
    disabled: "#666666",
    placeholder: "#888888",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

interface ThemeContextType {
  theme: Theme;
  paperTheme: typeof MD3LightTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [systemColorScheme, setSystemColorScheme] = useState<
    "light" | "dark" | null
  >(null);

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();

    // Listen to system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || "light");
    });

    // Get initial system color scheme
    setSystemColorScheme(Appearance.getColorScheme() || "light");

    return () => subscription?.remove();
  }, []);

  // Derive isDark directly from themeMode and system preference
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeMode");
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    // Update themeMode immediately for instant UI response
    setThemeMode(newMode);
    // Save to storage in background (non-blocking)
    saveThemePreference(newMode);
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    // Update state immediately for instant UI response
    setThemeMode(mode);
    // Save to storage in background (non-blocking)
    saveThemePreference(mode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  // Create Paper theme adapter
  const paperTheme = isDark
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: theme.colors.primary,
          secondary: theme.colors.primary, // Use primary instead of blue
          surface: theme.colors.surface,
          background: theme.colors.background,
          onSurface: theme.colors.text,
          onBackground: theme.colors.text,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: theme.colors.primary,
          secondary: theme.colors.primary, // Use primary instead of blue
          surface: theme.colors.surface,
          background: theme.colors.background,
          onSurface: theme.colors.text,
          onBackground: theme.colors.text,
        },
      };

  const contextValue: ThemeContextType = {
    theme,
    paperTheme,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
