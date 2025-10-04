import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, BarChart3, User } from "lucide-react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import ResultsScreen from "../screens/ResultsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { RootStackParamList, TabParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let IconComponent;

                    if (route.name === "HomeTab") {
                        IconComponent = Home;
                    } else if (route.name === "DashboardTab") {
                        IconComponent = BarChart3;
                    } else if (route.name === "ProfileTab") {
                        IconComponent = User;
                    }

                    return IconComponent ? (
                        <IconComponent size={size} color={color} />
                    ) : null;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    paddingBottom: Math.max(insets.bottom, 5),
                    paddingTop: 8,
                    height: 60 + Math.max(insets.bottom, 0),
                    position: 'absolute',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                    marginBottom: 4,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: "Scan",
                    title: "Home",
                }}
            />
            <Tab.Screen
                name="DashboardTab"
                component={DashboardScreen}
                options={{
                    tabBarLabel: "History",
                    title: "Dashboard",
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: "Profile",
                    title: "Profile",
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { theme, paperTheme } = useTheme();

    return (
        <PaperProvider theme={paperTheme}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: theme.colors.surface,
                            borderBottomColor: theme.colors.border,
                        },
                        headerTintColor: theme.colors.primary,
                        headerTitleStyle: {
                            fontWeight: "bold",
                            fontSize: 18,
                        },
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={TabNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Results"
                        component={ResultsScreen}
                        options={{
                            title: "Analysis Results",
                            headerLeft: () => null,
                        }}
                    />
                    <Stack.Screen
                        name="Dashboard"
                        component={DashboardScreen}
                        options={{
                            title: "Your Dashboard",
                        }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            title: "Profile",
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}