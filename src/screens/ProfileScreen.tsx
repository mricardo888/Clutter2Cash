import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  List,
  Avatar,
  Divider,
} from 'react-native-paper';
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
} from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme, spacing } from '../utils/theme';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [ecoTips, setEcoTips] = useState(true);

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    Alert.alert(
      'Theme Changed',
      value ? 'Dark mode enabled' : 'Light mode enabled'
    );
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
  };

  const handleEcoTipsToggle = (value: boolean) => {
    setEcoTips(value);
  };

  const handleShare = () => {
    Alert.alert(
      'Share Clutter2Cash',
      'Help others discover sustainable decluttering!',
      [
        { text: 'Cancel' },
        { text: 'Share', onPress: () => console.log('Sharing app') },
      ]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Contact us at support@clutter2cash.com'
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your data is secure and used only to provide better service.'
    );
  };

  const userStats = {
    name: 'Eco Warrior',
    level: 'Declutter Champion',
    itemsScanned: 12,
    co2Saved: '180kg',
    badges: ['Eco Hero', 'Declutter Champion', 'Sustainability Star'],
  };

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
            <Text style={styles.quickStatText}>{userStats.itemsScanned} items</Text>
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
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
                thumbColor={darkMode ? theme.colors.surface : theme.colors.disabled}
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
                trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
                thumbColor={notifications ? theme.colors.surface : theme.colors.disabled}
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
                trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
                thumbColor={ecoTips ? theme.colors.surface : theme.colors.disabled}
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
          onPress={() => navigation.navigate('Home')}
          style={styles.startButton}
        >
          Start Scanning
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: spacing.md,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },
  userLevel: {
    fontSize: 16,
    color: theme.colors.accent,
    marginBottom: spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickStatText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  badgesCard: {
    margin: spacing.md,
    backgroundColor: '#E8F5E8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: theme.colors.primary,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: theme.roundness,
    gap: spacing.xs,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  actionsCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  aboutCard: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: '#F3E5F5',
  },
  aboutText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
  },
  startButton: {
    marginBottom: spacing.md,
  },
});
