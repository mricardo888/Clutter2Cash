import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch, Alert } from "react-native";
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
  User,
  Settings,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  Share2,
  Award,
  Leaf,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [ecoTips, setEcoTips] = useState(true);

  const handleThemeModeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
  };

  const handleEcoTipsToggle = (value: boolean) => {
    setEcoTips(value);
  };

  const handleShare = () => {
    Alert.alert(
      "Share Clutter2Cash",
      "Help others discover sustainable decluttering!",
      [
        { text: "Cancel" },
        { text: "Share", onPress: () => console.log("Sharing app") },
      ]
    );
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

  const userStats = {
    name: "Eco Warrior",
    level: "Declutter Champion",
    itemsScanned: 12,
    co2Saved: "180kg",
    badges: ["Eco Hero", "Declutter Champion", "Sustainability Star"],
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label="EW"
          style={styles.avatar}
          labelStyle={styles.avatarLabel}
        />
        <Title style={styles.userName}>{userStats.name}</Title>
        <Text style={styles.userLevel}>{userStats.level}</Text>

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Leaf size={16} color={theme.colors.primary} />
            <Text style={styles.quickStatText}>{userStats.co2Saved} saved</Text>
          </View>
          <View style={styles.quickStat}>
            <Award size={16} color={theme.colors.accent} />
            <Text style={styles.quickStatText}>
              {userStats.itemsScanned} items
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.badgesCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>🏆 Your Badges</Title>
          <View style={styles.badgesContainer}>
            {userStats.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Award size={16} color={theme.colors.primary} />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>⚙️ Settings</Title>

          <List.Item
            title="Dark Mode"
            description="Switch between light and dark themes"
            left={() => <Moon size={24} color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={theme.colors.background === "#121212"}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  theme.colors.background === "#121212"
                    ? theme.colors.surface
                    : theme.colors.border
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
          <Title style={styles.cardTitle}>📱 App Actions</Title>

          <List.Item
            title="Share App"
            description="Help others discover Clutter2Cash"
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
          <Title style={styles.cardTitle}>🌱 About Clutter2Cash</Title>
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
        >
          Start Scanning
        </Button>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      backgroundColor: theme.colors.primary,
      marginBottom: theme.spacing.md,
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
      marginBottom: theme.spacing.xs,
    },
    userLevel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    quickStats: {
      flexDirection: "row",
      gap: theme.spacing.lg,
    },
    quickStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    quickStatText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    badgesCard: {
      margin: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    badgesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 8,
      gap: theme.spacing.xs,
    },
    badgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    settingsCard: {
      margin: theme.spacing.md,
      marginTop: 0,
      backgroundColor: theme.colors.card,
    },
    actionsCard: {
      margin: theme.spacing.md,
      marginTop: 0,
      backgroundColor: theme.colors.card,
    },
    aboutCard: {
      margin: theme.spacing.md,
      marginTop: 0,
      backgroundColor: theme.colors.card,
    },
    aboutText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 20,
    },
    versionText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    footer: {
      padding: theme.spacing.lg,
    },
    startButton: {
      marginBottom: theme.spacing.md,
    },
  });
