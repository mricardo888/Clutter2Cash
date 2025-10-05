import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
  Share,
} from "react-native";
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
  ActivityIndicator,
} from "react-native-paper";
import {
  User,
  Settings,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  Share2,
  Award,
  Leaf,
  Sparkles,
  Target,
  TrendingUp,
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

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string | null;
    isGuest: boolean;
    badges: string[];
  };
  stats: {
    totalItems: number;
    totalValue: number;
    totalCO2Saved: number;
    categoryBreakdown: any[];
  };
  message?: string;
}

export default function ProfileScreen({ navigation }: Props) {
  const { theme, toggleTheme, setThemeMode, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [ecoTips, setEcoTips] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeModeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
  };

  const handleEcoTipsToggle = (value: boolean) => {
    setEcoTips(value);
  };

  const handleDarkModeToggle = (value: boolean) => {
    toggleTheme();
  };

  const handleShare = async () => {
    try {
      const totalValue = profile?.stats.totalValue || 0;
      const totalCO2 = profile?.stats.totalCO2Saved || 0;
      const totalItems = profile?.stats.totalItems || 0;

      const shareText = `💰 I've unlocked $${totalValue.toFixed(2)} from ${totalItems} items using Clutter2Cash!\n\n` +
        `🌍 Environmental impact: ${totalCO2.toFixed(1)}kg CO₂ saved by keeping items in circulation.\n\n` +
        `Turn your clutter into cash while saving the planet! 📱\n` +
        `#Clutter2Cash #CircularEconomy #Sustainability`;

      await Share.share({
        message: shareText,
        title: "Check out my Clutter2Cash impact!",
      });
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        Alert.alert("Error", "Unable to share. Please try again.");
      }
    }
  };

  const handleHelp = () => {
    Alert.alert(
      "Help & Support",
      "Need help? Contact us at support@clutter2cash.com"
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your data is secure and used only to provide better service."
    );
  };

  const handleSignIn = () => {
    if (profile?.user.isGuest) {
      Alert.alert(
        "Sign Up to Save Your Data",
        "Create an account to keep your items and stats permanently!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Up", onPress: () => navigation.navigate("Login") },
        ]
      );
    } else {
      navigation.navigate("Login");
    }
  };

  const styles = createStyles(theme, insets);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Button mode="contained" onPress={loadProfile}>
          Retry
        </Button>
      </View>
    );
  }

  const { user, stats } = profile;
  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.surface}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Avatar.Text
            size={80}
            label={userInitials}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Title style={styles.userName}>{user.name}</Title>
          {user.isGuest && (
            <Text style={styles.guestBadge}>Guest Account</Text>
          )}
          {!user.isGuest && user.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}

          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Leaf size={16} color={theme.colors.primary} />
              <Text style={styles.quickStatText}>
                {stats.totalCO2Saved.toFixed(1)}kg saved
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Target size={16} color={theme.colors.primary} />
              <Text style={styles.quickStatText}>
                {stats.totalItems} items
              </Text>
            </View>
            <View style={styles.quickStat}>
              <TrendingUp size={16} color={theme.colors.success} />
              <Text style={styles.quickStatText}>
                ${stats.totalValue.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {user.badges && user.badges.length > 0 && (
          <Card style={styles.badgesCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Your Badges</Title>
              <View style={styles.badgesContainer}>
                {user.badges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Award size={16} color="white" />
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Settings</Title>

            <List.Item
              title="Dark Mode"
              description="Switch between light and dark themes"
              left={() => <Moon size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={isDark}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{
                    false: theme.colors.disabled,
                    true: theme.colors.primary,
                  }}
                  thumbColor={
                    isDark ? theme.colors.surface : theme.colors.disabled
                  }
                />
              )}
            />

            <Divider />

            <List.Item
              title="Push Notifications"
              description="Receive updates about your items"
              left={() => <Settings size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{
                    false: theme.colors.disabled,
                    true: theme.colors.primary,
                  }}
                  thumbColor={
                    notifications ? theme.colors.surface : theme.colors.disabled
                  }
                />
              )}
            />

            <Divider />

            <List.Item
              title="Eco Tips"
              description="Get sustainability tips and updates"
              left={() => <Leaf size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={ecoTips}
                  onValueChange={handleEcoTipsToggle}
                  trackColor={{
                    false: theme.colors.disabled,
                    true: theme.colors.primary,
                  }}
                  thumbColor={
                    ecoTips ? theme.colors.surface : theme.colors.disabled
                  }
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>App Actions</Title>

            <List.Item
              title={user.isGuest ? "Sign Up / Sign In" : "Account Settings"}
              description={
                user.isGuest
                  ? "Create an account to save your data"
                  : "Manage your account settings"
              }
              left={() => <User size={24} color={theme.colors.primary} />}
              onPress={handleSignIn}
            />

            <Divider />

            <List.Item
              title="Share Your Impact"
              description="Show others your sustainability achievements"
              left={() => <Share2 size={24} color={theme.colors.primary} />}
              onPress={handleShare}
            />

            <Divider />

            <List.Item
              title="Help & Support"
              description="Get help or report issues"
              left={() => <HelpCircle size={24} color={theme.colors.primary} />}
              onPress={handleHelp}
            />

            <Divider />

            <List.Item
              title="Privacy Policy"
              description="Learn about data protection"
              left={() => <Shield size={24} color={theme.colors.primary} />}
              onPress={handlePrivacy}
            />
          </Card.Content>
        </Card>

        <Card style={styles.aboutCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>About Clutter2Cash</Title>
            <Paragraph style={styles.aboutText}>
              Clutter2Cash helps you turn unused household items into cash while
              promoting sustainability. Every item you sell, donate, or recycle
              helps reduce waste and supports a circular economy.
            </Paragraph>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Home")}
            style={styles.startButton}
            labelStyle={{ color: "white" }}
          >
            Start Scanning
          </Button>
        </View>
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
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      marginBottom: 16,
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
    avatarLabel: {
      fontSize: 32,
      fontWeight: "bold",
      color: "white",
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    guestBadge: {
      fontSize: 14,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
      fontWeight: "600",
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    quickStats: {
      flexDirection: "row",
      gap: 16,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    quickStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    quickStatText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    guestMessage: {
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 8,
      alignItems: "center",
    },
    guestMessageText: {
      fontSize: 13,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    signUpButton: {
      marginTop: 4,
    },
    badgesCard: {
      margin: 16,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      color: theme.colors.text,
    },
    badgesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    badgeText: {
      color: "white",
      fontSize: 13,
      fontWeight: "600",
    },
    settingsCard: {
      margin: 16,
      marginTop: 8,
      backgroundColor: theme.colors.surface,
    },
    actionsCard: {
      margin: 16,
      marginTop: 8,
      backgroundColor: theme.colors.card,
    },
    aboutCard: {
      margin: 16,
      marginTop: 8,
      backgroundColor: theme.colors.card,
    },
    aboutText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    versionText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    footer: {
      padding: 24,
    },
    startButton: {
      marginBottom: 16,
    },
  });
