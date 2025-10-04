import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
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
import { Leaf, Target, LogOut } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth0 } from "../contexts/Auth0Context";
import { ApiService } from "../services/api";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, user, login, logout } = useAuth0();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const profileData = await ApiService.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const styles = createStyles(theme, insets);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar
          barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.surface}
        />
        <View style={styles.loginContainer}>
          <Avatar.Icon size={100} icon="leaf" style={styles.avatar} />
          <Title style={styles.loginTitle}>Welcome to Clutter2Cash</Title>
          <Paragraph style={styles.loginSubtitle}>
            Turn your clutter into cash while helping the planet
          </Paragraph>

          <Button
            mode="contained"
            onPress={login}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            Login with Auth0
          </Button>

          <Text style={styles.secureText}>
            🔒 Secure authentication powered by Auth0
          </Text>
        </View>
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
          <Avatar.Image
            size={80}
            source={{ uri: user?.picture }}
            style={styles.avatar}
          />
          <Title style={styles.userName}>{user?.name || "User"}</Title>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>

          {profile?.stats && !loadingProfile && (
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

        {loadingProfile ? (
          <View style={styles.loadingStats}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        ) : profile?.stats ? (
          <>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Your Impact</Title>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Value Unlocked:</Text>
                  <Text style={styles.statValue}>
                    ${profile.stats.totalValue?.toFixed(2) || "0.00"}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Items Scanned:</Text>
                  <Text style={styles.statValue}>
                    {profile.stats.totalItems || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>CO₂ Saved:</Text>
                  <Text style={styles.statValue}>
                    {profile.stats.totalCO2Saved || 0}kg
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {profile.user?.badges && profile.user.badges.length > 0 && (
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
          </>
        ) : null}

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Account</Title>
            <List.Item
              title="Logout"
              description="Sign out of your account"
              left={() => <LogOut size={24} color={theme.colors.error} />}
              onPress={logout}
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
    loginContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    loginTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 24,
      marginBottom: 8,
      textAlign: "center",
    },
    loginSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 48,
      maxWidth: 300,
    },
    loginButton: {
      width: "100%",
      maxWidth: 300,
    },
    loginButtonContent: {
      paddingVertical: 8,
    },
    secureText: {
      marginTop: 24,
      fontSize: 12,
      color: theme.colors.textSecondary,
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
    loadingStats: {
      padding: 32,
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
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
