import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, StatusBar, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Card,
    Title,
    Paragraph,
    Text,
    Button,
    List,
    Avatar,
    ActivityIndicator,
} from "react-native-paper";
import {
    Leaf,
    Target,
    Shield,
    LogOut,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { ApiService } from "../services/api";

type ProfileScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Profile"
>;

interface Props {
    navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Login/Register form
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // User profile data
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = await ApiService.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                loadProfile();
            }
        } catch (error) {
            console.error("Error checking auth:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const profileData = await ApiService.getProfile();
            setProfile(profileData);
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert("Error", "Failed to load profile");
        }
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLoginMode && !name)) {
            Alert.alert("Missing Info", "Please fill in all fields");
            return;
        }

        setAuthLoading(true);
        try {
            if (isLoginMode) {
                await ApiService.login(email, password);
                Alert.alert("Success", "Logged in successfully!");
            } else {
                await ApiService.register(name, email, password);
                Alert.alert("Success", "Account created successfully!");
            }

            setIsAuthenticated(true);
            await loadProfile();

            // Clear form
            setName("");
            setEmail("");
            setPassword("");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Authentication failed");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await ApiService.logout();
                        setIsAuthenticated(false);
                        setProfile(null);
                        Alert.alert("Success", "Logged out successfully");
                    },
                },
            ]
        );
    };

    const styles = createStyles(theme, insets);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Login/Register Screen
    if (!isAuthenticated) {
        return (
            <>
                <StatusBar
                    barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
                    backgroundColor={theme.colors.surface}
                />
                <ScrollView style={styles.container}>
                    <View style={[styles.authContainer, { paddingTop: insets.top + 40 }]}>
                        <Avatar.Icon
                            size={80}
                            icon="account"
                            style={styles.avatar}
                        />
                        <Title style={styles.authTitle}>
                            {isLoginMode ? "Welcome Back!" : "Create Account"}
                        </Title>
                        <Paragraph style={styles.authSubtitle}>
                            {isLoginMode
                                ? "Login to track your decluttering journey"
                                : "Join Clutter2Cash to start your journey"}
                        </Paragraph>

                        <Card style={styles.authCard}>
                            <Card.Content>
                                {!isLoginMode && (
                                    <TextInput
                                        placeholder="Full Name"
                                        value={name}
                                        onChangeText={setName}
                                        style={styles.input}
                                        placeholderTextColor={theme.colors.placeholder}
                                        editable={!authLoading}
                                    />
                                )}
                                <TextInput
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={styles.input}
                                    placeholderTextColor={theme.colors.placeholder}
                                    editable={!authLoading}
                                />
                                <TextInput
                                    placeholder="Password"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.input}
                                    placeholderTextColor={theme.colors.placeholder}
                                    editable={!authLoading}
                                />

                                <Button
                                    mode="contained"
                                    onPress={handleAuth}
                                    loading={authLoading}
                                    disabled={authLoading}
                                    style={styles.authButton}
                                >
                                    {isLoginMode ? "Login" : "Sign Up"}
                                </Button>

                                <Button
                                    mode="text"
                                    onPress={() => setIsLoginMode(!isLoginMode)}
                                    disabled={authLoading}
                                    style={styles.switchButton}
                                >
                                    {isLoginMode
                                        ? "Don't have an account? Sign Up"
                                        : "Already have an account? Login"}
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>
                </ScrollView>
            </>
        );
    }

    // Profile Screen (authenticated)
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
                        label={profile?.user?.name?.slice(0, 2).toUpperCase() || "??"}
                        style={styles.avatar}
                    />
                    <Title style={styles.userName}>
                        {profile?.user?.name || "User"}
                    </Title>
                    <Text style={styles.userEmail}>
                        {profile?.user?.email || ""}
                    </Text>

                    {profile?.stats && (
                        <View style={styles.quickStats}>
                            <View style={styles.quickStat}>
                                <Leaf size={16} color={theme.colors.primary} />
                                <Text style={styles.quickStatText}>
                                    {profile.stats.totalCO2Saved}kg CO₂ saved
                                </Text>
                            </View>
                            <View style={styles.quickStat}>
                                <Target size={16} color={theme.colors.accent} />
                                <Text style={styles.quickStatText}>
                                    {profile.stats.totalItems} items
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <Card style={styles.statsCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Your Stats</Title>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Total Value Unlocked:</Text>
                            <Text style={styles.statValue}>
                                ${profile?.stats?.totalValue?.toFixed(2) || "0.00"}
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Items Scanned:</Text>
                            <Text style={styles.statValue}>
                                {profile?.stats?.totalItems || 0}
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>CO₂ Saved:</Text>
                            <Text style={styles.statValue}>
                                {profile?.stats?.totalCO2Saved || 0}kg
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {profile?.user?.badges && profile.user.badges.length > 0 && (
                    <Card style={styles.badgesCard}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Badges</Title>
                            <View style={styles.badgesRow}>
                                {profile.user.badges.map((badge: string, index: number) => (
                                    <View key={index} style={styles.badge}>
                                        <Text style={styles.badgeText}>{badge}</Text>
                                    </View>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                <Card style={styles.actionsCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Account</Title>
                        <List.Item
                            title="Logout"
                            description="Sign out of your account"
                            left={() => <LogOut size={24} color={theme.colors.error} />}
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
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background,
        },
        authContainer: {
            padding: 24,
            alignItems: "center",
        },
        authTitle: {
            fontSize: 28,
            fontWeight: "bold",
            color: theme.colors.text,
            marginTop: 16,
        },
        authSubtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginTop: 8,
            marginBottom: 32,
        },
        authCard: {
            width: "100%",
            backgroundColor: theme.colors.surface,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 16,
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
        },
        authButton: {
            marginTop: 8,
            paddingVertical: 4,
        },
        switchButton: {
            marginTop: 8,
        },
        header: {
            padding: 24,
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        avatar: {
            backgroundColor: theme.colors.primary,
            marginBottom: 16,
        },
        userName: {
            fontSize: 24,
            fontWeight: "bold",
            color: theme.colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 16,
        },
        quickStats: {
            flexDirection: "row",
            gap: 24,
            marginTop: 8,
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
        statsCard: {
            margin: 16,
            backgroundColor: theme.colors.surface,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 16,
            color: theme.colors.text,
        },
        statRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
        },
        statLabel: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        statValue: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.colors.primary,
        },
        badgesCard: {
            margin: 16,
            marginTop: 0,
            backgroundColor: theme.colors.surface,
        },
        badgesRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        badge: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
        },
        badgeText: {
            color: "white",
            fontSize: 12,
            fontWeight: "600",
        },
        actionsCard: {
            margin: 16,
            marginTop: 0,
            backgroundColor: theme.colors.surface,
            marginBottom: insets.bottom + 80,
        },
    });