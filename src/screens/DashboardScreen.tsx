import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Card,
  Title,
  Paragraph,
  Text,
  FAB,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import {
  DollarSign,
  Leaf,
  Package,
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Clock,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, ScannedItem, UserStats } from "../types";
import { ApiService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

export default function DashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalValueUnlocked: 0,
    totalCO2Saved: "0kg",
    itemsScanned: 0,
    badges: ["Declutter Rookie"],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const history = await ApiService.getHistory();
      setItems(history);

      // Calculate stats
      const totalValue = history.reduce((sum, item) => sum + item.value, 0);
      const totalCO2 = history.reduce((sum, item) => {
        // Match numbers (including decimals) followed by optional space and "kg" or "CO₂"
        const co2Match = item.ecoImpact.match(/(\d+\.?\d*)\s*kg/i);
        return sum + (co2Match ? parseFloat(co2Match[1]) : 0);
      }, 0);

      setStats({
        totalValueUnlocked: totalValue,
        totalCO2Saved: `${totalCO2.toFixed(1)}kg`,
        itemsScanned: history.length,
        badges:
          history.length >= 5
            ? ["Eco Hero", "Declutter Champion"]
            : ["Declutter Rookie"],
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case "sell":
        return theme.colors.success;
      case "donate":
        return "#E91E63";
      case "recycle":
        return theme.colors.primary;
      default:
        return theme.colors.disabled;
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "sell":
        return <DollarSign size={16} color="white" />;
      case "donate":
        return <Package size={16} color="white" />;
      case "recycle":
        return <Leaf size={16} color="white" />;
      default:
        return <Package size={16} color="white" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const renderItem = ({ item }: { item: ScannedItem }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Title style={styles.itemName}>{item.name}</Title>
            <Text style={styles.itemDate}>
              <Clock size={14} color={theme.colors.placeholder} />{" "}
              {formatDate(item.timestamp)}
            </Text>
          </View>
          {item.action && (
            <Chip
              style={[
                styles.actionChip,
                { backgroundColor: getActionColor(item.action) },
              ]}
              textStyle={styles.actionChipText}
              icon={() => getActionIcon(item.action)}
            >
              {item.action}
            </Chip>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemStat}>
            <DollarSign size={16} color={theme.colors.success} />
            <Text style={styles.itemStatText}>${item.value.toFixed(2)}</Text>
          </View>
          <View style={styles.itemStat}>
            <Leaf size={16} color={theme.colors.primary} />
            <Text style={styles.itemStatText}>
              {(() => {
                // Extract number from ecoImpact string and format to 1 decimal
                const match = item.ecoImpact.match(/(\d+\.?\d*)/);
                if (match) {
                  const num = parseFloat(match[1]);
                  return item.ecoImpact.replace(match[1], num.toFixed(1));
                }
                return item.ecoImpact;
              })()}
            </Text>
          </View>
        </View>

        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
        )}
      </Card.Content>
    </Card>
  );

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title style={styles.statsTitle}>Your Impact</Title>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <DollarSign size={24} color={theme.colors.success} />
            <Text style={styles.statValue}>
              ${stats.totalValueUnlocked.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Total Value Unlocked</Text>
          </View>

          <View style={styles.statItem}>
            <Leaf size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stats.totalCO2Saved} CO₂</Text>
            <Text style={styles.statLabel}>Total CO₂ Saved</Text>
          </View>

          <View style={styles.statItem}>
            <BarChart3 size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stats.itemsScanned}</Text>
            <Text style={styles.statLabel}>Items Scanned</Text>
          </View>
        </View>

        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>Badges Earned:</Text>
          <View style={styles.badgesRow}>
            {stats.badges.map((badge, index) => (
              <Chip
                key={index}
                style={styles.badge}
                textStyle={styles.badgeText}
              >
                {badge}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const styles = createStyles(theme, insets);

  if (loading) {
    return (
      <>
        <StatusBar
          barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.surface}
      />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Title style={styles.title}>Your Dashboard</Title>
          <Paragraph style={styles.subtitle}>
            Track your decluttering journey and environmental impact
          </Paragraph>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderStats}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + 80 }, // Account for FAB
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Package size={48} color={theme.colors.disabled} />
                <Title style={styles.emptyTitle}>No Items Yet</Title>
                <Paragraph style={styles.emptyDescription}>
                  Start scanning items to see your history and impact here!
                </Paragraph>
              </Card.Content>
            </Card>
          }
        />

        <FAB
          style={[styles.fab, { bottom: insets.bottom + 76 }]}
          icon="plus"
          label="Scan Item"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
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
      paddingTop: insets.top,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.placeholder,
    },
    header: {
      padding: theme.spacing.lg,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.colors.primary,
      marginBottom: theme.spacing.md,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    listContainer: {
      padding: 16,
    },
    statsCard: {
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      color: theme.colors.primary,
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
      minWidth: 0, // Allow flex to work properly
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 4,
      marginBottom: 4,
      textAlign: "center",
      width: "100%", // Ensure full width for proper centering
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.placeholder,
      textAlign: "center",
    },
    badgesContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.disabled,
      paddingTop: 16,
    },
    badgesTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      color: theme.colors.text,
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -4,
    },
    badge: {
      backgroundColor: theme.colors.accent,
      marginHorizontal: 4,
      marginVertical: 4,
    },
    badgeText: {
      color: "white",
      fontSize: 12,
    },
    itemCard: {
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: theme.colors.card,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    itemDate: {
      fontSize: 12,
      color: theme.colors.placeholder,
    },
    actionChip: {
      marginLeft: 8,
    },
    actionChipText: {
      color: "white",
      fontSize: 12,
    },
    itemDetails: {
      flexDirection: "row",
      marginBottom: 16,
    },
    itemStat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 24,
    },
    itemStatText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 4,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    emptyCard: {
      marginTop: 16,
      backgroundColor: theme.colors.card,
    },
    emptyContent: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      marginBottom: 8,
      color: theme.colors.text,
    },
    emptyDescription: {
      fontSize: 14,
      color: theme.colors.placeholder,
      textAlign: "center",
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      backgroundColor: theme.colors.primary,
    },
  });
