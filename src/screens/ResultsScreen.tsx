import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Button, Card, Title, Paragraph, Text, Chip } from "react-native-paper";
import {
  Leaf,
  Share2,
  Sparkles,
  TrendingUp,
  MapPin,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, ScannedItem } from "../types";
import { ApiService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Results"
>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, "Results">;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

export default function ResultsScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { item } = route.params;

  const handleShare = async () => {
    try {
      // Calculate CO2 savings (rough estimate: $1 value = 0.1kg CO2 saved)
      const co2Saved = (item.value * 0.1).toFixed(1);

      // Create shareable message
      const shareText = `💰 I just unlocked $${item.value} from my ${item.name} using Clutter2Cash! ♻️\n\n` +
        `🌍 Environmental impact: ${co2Saved}kg CO₂ saved by keeping items in circulation.\n\n` +
        `Stop throwing money away - turn your clutter into cash! 📱\n` +
        `#Clutter2Cash #CircularEconomy #Sustainability`;

      // Use React Native Share API
      const Share = require('react-native').Share;

      await Share.share({
        message: shareText,
        title: `I made $${item.value} decluttering!`,
      }, {
        // iOS specific
        subject: `Check out my Clutter2Cash savings!`,
      });
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.message !== 'User did not share') {
        Alert.alert("Error", "Unable to share. Please try again.");
      }
    }
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={48} color={theme.colors.primary} />
        <Title style={styles.title}>Analysis Complete!</Title>
        <Paragraph style={styles.subtitle}>
          Here's what we found about your item
        </Paragraph>
      </View>

      {item.imageUri && (
        <Card style={styles.imageCard}>
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        </Card>
      )}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.itemName}>{item.name}</Title>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TrendingUp size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>${item.value.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Estimated Value</Text>
            </View>

            <View style={styles.statItem}>
              <Leaf size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>
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
              <Text style={styles.statLabel}>Eco Impact</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.actionsTitle}>What would you like to do?</Title>
          <Paragraph style={styles.actionsDescription}>
            Choose an action to help reduce waste and maximize value
          </Paragraph>

          <Button
            mode="contained"
            onPress={() => navigation.navigate("ActionPlaces", { item })}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            icon={() => <MapPin size={20} color="white" />}
          >
            Find Places
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.shareCard}>
        <Card.Content>
          <Title style={styles.shareTitle}>Share Your Impact</Title>
          <Paragraph style={styles.shareDescription}>
            Let others know about your sustainable choice!
          </Paragraph>

          <Button
            mode="outlined"
            onPress={handleShare}
            icon={() => <Share2 size={20} color={theme.colors.primary} />}
            style={styles.shareButton}
          >
            Share on Social Media
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footerButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Home")}
          style={styles.footerButton}
        >
          Scan Another Item
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.footerButton}
        >
          View History
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
      padding: 24,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginTop: 16,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.text,
    },
    imageCard: {
      margin: 16,
      marginBottom: 8,
    },
    image: {
      width: "100%",
      height: 200,
      borderRadius: 8,
    },
    infoCard: {
      margin: 16,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    itemName: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 24,
      color: theme.colors.primary,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
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
    actionsCard: {
      margin: 16,
      marginBottom: 8,
    },
    actionsTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
    },
    actionsDescription: {
      fontSize: 14,
      color: theme.colors.placeholder,
      marginBottom: 24,
    },
    actionButton: {
      marginTop: 8,
    },
    shareCard: {
      margin: 16,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    shareTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    shareDescription: {
      fontSize: 14,
      color: theme.colors.placeholder,
      marginBottom: 16,
    },
    shareButton: {
      alignSelf: "center",
    },
    footerButtons: {
      flexDirection: "row",
      padding: 24,
    },
    footerButton: {
      flex: 1,
      marginHorizontal: 8,
    },
  });
