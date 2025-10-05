import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Linking } from "react-native";
import {
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Chip,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import {
  Phone,
  Globe,
  DollarSign,
  Heart,
  Recycle,
  Star,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, ScannedItem } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { ApiService } from "../services/api";

type ActionPlacesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ActionPlaces"
>;
type ActionPlacesScreenRouteProp = RouteProp<
  RootStackParamList,
  "ActionPlaces"
>;

interface Props {
  navigation: ActionPlacesScreenNavigationProp;
  route: ActionPlacesScreenRouteProp;
}

interface Place {
  id?: string;
  name: string;
  type: "selling" | "donation" | "recycling";
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  description: string;
  specialInstructions?: string;
  hours?: string;
}

export default function ActionPlacesScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { item } = route.params;
  const [selectedType, setSelectedType] = useState<
    "selling" | "donation" | "recycling"
  >("selling");
  const [loading, setLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [sellingPlaces, setSellingPlaces] = useState<Place[]>([]);
  const [donationPlaces, setDonationPlaces] = useState<Place[]>([]);
  const [recyclingPlaces, setRecyclingPlaces] = useState<Place[]>([]);

  useEffect(() => {
    loadPlacesData();
  }, []);

  const loadPlacesData = async () => {
    try {
      setPlacesLoading(true);

      console.log("Loading places for item:", item.id);

      // Fetch the full item details which should contain actionPlaces data
      const itemDetails = await ApiService.getItemById(item.id);

      console.log(
        "Item details received:",
        JSON.stringify(itemDetails, null, 2)
      );

      // Check if actionPlaces exists in fullAnalysis
      if (itemDetails?.fullAnalysis?.actionPlaces) {
        const { selling, donation, recycling } =
          itemDetails.fullAnalysis.actionPlaces;

        console.log("Action places found:", {
          selling: selling?.length,
          donation: donation?.length,
          recycling: recycling?.length,
        });

        // Add unique IDs to places if they don't have them
        if (selling && Array.isArray(selling)) {
          setSellingPlaces(
            selling.map((place: Place, index: number) => ({
              ...place,
              id: place.id || `selling-${index}`,
            }))
          );
        }

        if (donation && Array.isArray(donation)) {
          setDonationPlaces(
            donation.map((place: Place, index: number) => ({
              ...place,
              id: place.id || `donation-${index}`,
            }))
          );
        }

        if (recycling && Array.isArray(recycling)) {
          setRecyclingPlaces(
            recycling.map((place: Place, index: number) => ({
              ...place,
              id: place.id || `recycling-${index}`,
            }))
          );
        }
      } else {
        console.log("No actionPlaces found in item details");
        console.log(
          "Full analysis structure:",
          itemDetails?.fullAnalysis
            ? Object.keys(itemDetails.fullAnalysis)
            : "No fullAnalysis"
        );
      }
    } catch (error) {
      console.error("Error loading places data:", error);
      Alert.alert("Error", "Failed to load places data. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setPlacesLoading(false);
    }
  };

  const getPlacesForType = (
    type: "selling" | "donation" | "recycling"
  ): Place[] => {
    switch (type) {
      case "selling":
        return sellingPlaces;
      case "donation":
        return donationPlaces;
      case "recycling":
        return recyclingPlaces;
      default:
        return [];
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const handleChoosePlace = async (place: Place) => {
    setLoading(true);

    try {
      console.log("Choosing place:", {
        placeName: place.name,
        placeType: place.type,
        itemId: item.id,
        itemName: item.name,
      });

      // Validate required data
      if (!item.id) {
        throw new Error("Item ID is missing");
      }

      if (!place.type) {
        throw new Error("Place type is missing");
      }

      // Normalize the status value to match backend expectations
      const normalizedType = place.type?.toLowerCase().trim();
      const statusValue =
        normalizedType === "selling" || normalizedType === "sell"
          ? "listed"
          : normalizedType === "donation" || normalizedType === "donate"
          ? "donated"
          : normalizedType === "recycling" ||
            normalizedType === "recycle" ||
            normalizedType === "recyclable"
          ? "recycling"
          : "scanned"; // fallback

      console.log("Sending update with status:", statusValue);

      // Update the item status based on the action type
      await ApiService.updateItem(item.id, {
        status: statusValue,
        userNotes: `Chose ${place.name} for ${place.type}`,
      });

      console.log("Update successful!");

      setLoading(false);

      Alert.alert(
        "Great Choice! 🌱",
        `You've chosen to ${place.type} your ${item.name} at ${place.name}. This helps reduce waste and supports sustainability!`,
        [
          {
            text: "View History",
            onPress: () => navigation.navigate("Dashboard"),
          },
          {
            text: "Scan Another",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error("Error choosing place:", error);

      // Show more specific error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to save your choice: ${errorMessage}`, [
        { text: "OK" },
      ]);
    }
  };

  const getTypeIcon = (type: string) => {
    // Normalize type values to handle backend inconsistencies
    const normalizedType = type?.toLowerCase().trim();

    switch (normalizedType) {
      case "selling":
      case "sell":
        return <DollarSign size={20} color={theme.colors.success} />;
      case "donation":
      case "donate":
        return <Heart size={20} color="#E91E63" />;
      case "recycling":
      case "recycle":
      case "recyclable":
        return <Recycle size={20} color={theme.colors.primary} />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    // Normalize type values to handle backend inconsistencies
    const normalizedType = type?.toLowerCase().trim();

    console.log(
      "Getting color for type:",
      type,
      "-> normalized:",
      normalizedType
    );

    switch (normalizedType) {
      case "selling":
      case "sell":
        return theme.colors.success;
      case "donation":
      case "donate":
        return "#E91E63";
      case "recycling":
      case "recycle":
      case "recyclable":
        return theme.colors.primary;
      default:
        console.warn("Unknown type for color:", type);
        return theme.colors.disabled;
    }
  };

  const styles = createStyles(theme);

  if (placesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading places...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Globe size={48} color={theme.colors.primary} />
        <Title style={styles.title}>Find Places</Title>
        <Paragraph style={styles.subtitle}>
          Discover where you can {selectedType} your {item.name}
        </Paragraph>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === "selling"}
          onPress={() => setSelectedType("selling")}
          icon={() => getTypeIcon("selling")}
          style={[
            styles.filterChip,
            selectedType === "selling" && {
              backgroundColor: getTypeColor("selling"),
            },
          ]}
          textStyle={selectedType === "selling" ? { color: "white" } : {}}
        >
          Sell
        </Chip>

        <Chip
          selected={selectedType === "donation"}
          onPress={() => setSelectedType("donation")}
          icon={() => getTypeIcon("donation")}
          style={[
            styles.filterChip,
            selectedType === "donation" && {
              backgroundColor: getTypeColor("donation"),
            },
          ]}
          textStyle={selectedType === "donation" ? { color: "white" } : {}}
        >
          Donate
        </Chip>

        <Chip
          selected={selectedType === "recycling"}
          onPress={() => setSelectedType("recycling")}
          icon={() => getTypeIcon("recycling")}
          style={[
            styles.filterChip,
            selectedType === "recycling" && {
              backgroundColor: getTypeColor("recycling"),
            },
          ]}
          textStyle={selectedType === "recycling" ? { color: "white" } : {}}
        >
          Recycle
        </Chip>
      </View>

      {/* Places List */}
      <View style={styles.placesContainer}>
        {getPlacesForType(selectedType).length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>
                No {selectedType} places available for this item at the moment.
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          getPlacesForType(selectedType).map((place) => (
            <Card key={place.id} style={styles.placeCard}>
              <Card.Content>
                <View style={styles.placeHeader}>
                  <View style={styles.placeInfo}>
                    <Title style={styles.placeName}>{place.name}</Title>
                  </View>
                  {place.rating && (
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.rating}>{place.rating}</Text>
                    </View>
                  )}
                </View>

                <Paragraph style={styles.placeDescription}>
                  {place.description}
                </Paragraph>

                {place.hours && <Text style={styles.hours}>{place.hours}</Text>}

                {place.specialInstructions && (
                  <Text style={styles.specialInstructions}>
                    💡 {place.specialInstructions}
                  </Text>
                )}

                <Divider style={styles.divider} />

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {place.phone && (
                    <Button
                      mode="outlined"
                      onPress={() => handleCall(place.phone!)}
                      icon={() => (
                        <Phone size={16} color={theme.colors.primary} />
                      )}
                      style={styles.actionButton}
                    >
                      Call
                    </Button>
                  )}

                  {place.website && (
                    <Button
                      mode="outlined"
                      onPress={() => handleWebsite(place.website!)}
                      icon={() => (
                        <Globe size={16} color={theme.colors.primary} />
                      )}
                      style={styles.actionButton}
                    >
                      Website
                    </Button>
                  )}

                  <Button
                    mode="contained"
                    onPress={() => handleChoosePlace(place)}
                    style={[
                      styles.chooseButton,
                      { backgroundColor: getTypeColor(place.type) },
                    ]}
                    loading={loading}
                  >
                    Choose {place.type === "selling" ? "Platform" : "Place"}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      <View style={styles.footerButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.footerButton}
        >
          Back to Results
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
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      marginBottom: 16,
      justifyContent: "space-around",
    },
    filterChip: {
      marginHorizontal: 4,
    },
    placesContainer: {
      paddingHorizontal: 16,
    },
    emptyCard: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    emptyText: {
      textAlign: "center",
      color: theme.colors.placeholder,
      fontSize: 14,
    },
    placeCard: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    placeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    placeInfo: {
      flex: 1,
    },
    placeName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    rating: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    placeDescription: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
    },
    hours: {
      fontSize: 12,
      color: theme.colors.placeholder,
      marginBottom: 8,
    },
    specialInstructions: {
      fontSize: 12,
      color: theme.colors.primary,
      fontStyle: "italic",
      marginBottom: 12,
    },
    divider: {
      marginVertical: 12,
    },
    actionButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    actionButton: {
      marginBottom: 8,
      flex: 1,
      marginHorizontal: 2,
    },
    chooseButton: {
      marginTop: 8,
      width: "100%",
    },
    footerButtons: {
      padding: 24,
    },
    footerButton: {
      marginBottom: 8,
    },
  });
