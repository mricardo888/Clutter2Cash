import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from "react-native";
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
  MapPin,
  Phone,
  Globe,
  Navigation,
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
  distance?: string;
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

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${encodedAddress}`
        : `geo:0,0?q=${encodedAddress}`;
    Linking.openURL(url);
  };

  const handleChoosePlace = async (place: Place) => {
    setLoading(true);

    try {
      // Update the item status based on the action type
      await ApiService.updateItem(item.id, {
        status: place.type === "selling" ? "listed" : place.type,
        userNotes: `Chose ${place.name} for ${place.type}`,
      });

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
      Alert.alert("Error", "Failed to save your choice. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "selling":
        return <DollarSign size={20} color={theme.colors.success} />;
      case "donation":
        return <Heart size={20} color="#E91E63" />;
      case "recycling":
        return <Recycle size={20} color={theme.colors.primary} />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "selling":
        return theme.colors.success;
      case "donation":
        return "#E91E63";
      case "recycling":
        return theme.colors.primary;
      default:
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
        <MapPin size={48} color={theme.colors.primary} />
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
                    <Text style={styles.placeAddress}>{place.address}</Text>
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

                {place.distance && (
                  <View style={styles.distanceContainer}>
                    <MapPin size={14} color={theme.colors.placeholder} />
                    <Text style={styles.distance}>{place.distance}</Text>
                  </View>
                )}

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

                  {place.type !== "selling" &&
                    place.address !== "Online Marketplace" &&
                    place.address !== "Mobile App" && (
                      <Button
                        mode="outlined"
                        onPress={() => handleDirections(place.address)}
                        icon={() => (
                          <Navigation size={16} color={theme.colors.primary} />
                        )}
                        style={styles.actionButton}
                      >
                        Directions
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
    placeAddress: {
      fontSize: 14,
      color: theme.colors.placeholder,
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
    distanceContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    distance: {
      marginLeft: 4,
      fontSize: 12,
      color: theme.colors.placeholder,
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
