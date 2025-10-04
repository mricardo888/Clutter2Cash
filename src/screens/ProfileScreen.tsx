import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Switch, Alert, StatusBar, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Card,
    Title,
    Paragraph,
    Text,
    Button,
    List,
    Avatar,
    Divider,
} from "react-native-paper";
import {
    Moon,
    Leaf,
    Target,
    Award,
    Share2,
    HelpCircle,
    Shield,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🧩 Added

type ProfileScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Profile"
>;

interface Props {
    navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
    const { theme, toggleTheme, setThemeMode, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const [notifications, setNotifications] = useState(true);
    const [ecoTips, setEcoTips] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);

    // 🧩 Login state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const backendURL = "https://your-tunnel-url.ngrok.io"; // 🧩 replace with your tunnel

    // 🧩 Auto-load saved token
    useEffect(() => {
        AsyncStorage.getItem("authToken").then((savedToken) => {
            if (savedToken) setToken(savedToken);
        });
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            return Alert.alert("Missing Info", "Please enter both username and password.");
        }

        setLoading(true);
        try {
            const res = await fetch(`${backendURL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (res.ok && data.token) {
                await AsyncStorage.setItem("authToken", data.token);
                setToken(data.token);
                Alert.alert("✅ Login Successful", `Welcome, ${username}!`);
            } else {
                Alert.alert("❌ Login Failed", data.error || "Invalid credentials.");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("authToken");
        setToken(null);
        setUsername("");
        setPassword("");
        Alert.alert("👋 Logged out", "You have been logged out.");
    };

    const styles = createStyles(theme, insets) as any;

    // 🧩 Show login screen if not logged in
    if (!token) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Avatar.Text size={80} label="?" style={styles.avatar} />
                <Title style={styles.userName}>Welcome to Clutter2Cash</Title>
                <Paragraph style={{ marginBottom: 16, color: theme.colors.textSecondary }}>
                    Please log in to access your profile
                </Paragraph>

                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.loginButton}
                >
                    Login
                </Button>

                <Button onPress={() => Alert.alert("Sign Up", "Coming soon!")}>Sign Up</Button>
            </View>
        );
    }

    // 🧩 Regular profile UI if logged in
    return (
        <>
            <StatusBar
                barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor={theme.colors.surface}
            />
            <ScrollView style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <Avatar.Text
                        size={80}
                        label={username.slice(0, 2).toUpperCase()}
                        style={styles.avatar}
                    />
                    <Title style={styles.userName}>{username}</Title>
                    <Text style={styles.userLevel}>Declutter Champion</Text>

                    <View style={styles.quickStats}>
                        <View style={styles.quickStat}>
                            <Leaf size={16} color={theme.colors.primary} />
                            <Text style={styles.quickStatText}>180kg saved</Text>
                        </View>
                        <View style={styles.quickStat}>
                            <Target size={16} color={theme.colors.accent} />
                            <Text style={styles.quickStatText}>12 items</Text>
                        </View>
                    </View>
                </View>

                {/* existing cards remain unchanged */}
                <Card style={styles.actionsCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Account</Title>
                        <List.Item
                            title="Logout"
                            description="Sign out of your account"
                            left={() => <Shield size={24} color={theme.colors.primary} />}
                            onPress={handleLogout}
                        />
                    </Card.Content>
                </Card>
            </ScrollView>
        </>
    );
}

const createStyles = (theme: any, insets: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 16,
        },
        avatar: {
            backgroundColor: theme.colors.primary,
            marginBottom: 16,
        },
        userName: {
            fontSize: 22,
            fontWeight: "bold",
            color: theme.colors.text,
        },
        userLevel: {
            color: theme.colors.textSecondary,
            marginBottom: 16,
        },
        input: {
            width: "80%",
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            color: theme.colors.text,
        },
        loginButton: {
            width: "60%",
            marginTop: 10,
        },
        quickStats: {
            flexDirection: "row",
            gap: 24,
        },
        quickStat: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        quickStatText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        actionsCard: {
            margin: 16,
            backgroundColor: theme.colors.card,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
            color: theme.colors.text,
        },
    });
