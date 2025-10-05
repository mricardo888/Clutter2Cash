import React, { useState } from "react";
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
  id: string;
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

  // Mock data for donation and recycling places
  const mockDonationPlaces: Place[] = [
    {
      id: "donation-1",
      name: "Goodwill Industries",
      type: "donation",
      address: "123 Main Street, Downtown",
      phone: "(555) 123-4567",
      website: "https://goodwill.org",
      rating: 4.2,
      distance: "2.3 miles",
      description:
        "Accepts clothing, electronics, furniture, and household items",
      hours: "Mon-Sat: 9AM-9PM, Sun: 10AM-6PM",
      specialInstructions:
        "Bring items in good condition. Electronics must be working.",
    },
    {
      id: "donation-2",
      name: "Salvation Army Family Store",
      type: "donation",
      address: "456 Oak Avenue, Midtown",
      phone: "(555) 987-6543",
      website: "https://salvationarmy.org",
      rating: 4.5,
      distance: "3.1 miles",
      description: "Community thrift store supporting local programs",
      hours: "Mon-Sat: 8AM-8PM, Sun: 12PM-6PM",
      specialInstructions: "Free pickup available for large items",
    },
    {
      id: "donation-3",
      name: "Habitat for Humanity ReStore",
      type: "donation",
      address: "789 Pine Street, Uptown",
      phone: "(555) 456-7890",
      website: "https://habitat.org",
      rating: 4.7,
      distance: "4.2 miles",
      description: "Building materials, furniture, and home improvement items",
      hours: "Tue-Sat: 9AM-6PM, Sun-Mon: Closed",
      specialInstructions:
        "Specializes in construction and home improvement items",
    },
  ];

  const mockRecyclingPlaces: Place[] = [
    {
      id: "recycling-1",
      name: "Green Earth Recycling Center",
      type: "recycling",
      address: "321 Green Way, Eco District",
      phone: "(555) 321-9876",
      website: "https://greenearthrecycling.com",
      rating: 4.3,
      distance: "1.8 miles",
      description: "Comprehensive electronics and appliance recycling",
      hours: "Mon-Fri: 7AM-6PM, Sat: 8AM-4PM, Sun: Closed",
      specialInstructions:
        "Free drop-off for electronics. Data destruction available.",
    },
    {
      id: "recycling-2",
      name: "City Recycling Facility",
      type: "recycling",
      address: "654 Municipal Drive, City Center",
      phone: "(555) 654-3210",
      website: "https://cityrecycling.gov",
      rating: 4.0,
      distance: "2.7 miles",
      description: "Municipal recycling center for all recyclable materials",
      hours: "Mon-Sat: 6AM-8PM, Sun: 8AM-5PM",
      specialInstructions:
        "Separate materials by type. ID required for drop-off.",
    },
    {
      id: "recycling-3",
      name: "TechCycle Electronics",
      type: "recycling",
      address: "987 Circuit Lane, Tech Park",
      phone: "(555) 789-0123",
      website: "https://techcycle.com",
      rating: 4.6,
      distance: "3.5 miles",
      description: "Specialized electronics recycling with data security",
      hours: "Mon-Fri: 8AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM",
      specialInstructions:
        "Certified data destruction. Receipt provided for tax deduction.",
    },
  ];

  // Extract selling places from API data (if available)
  const getSellingPlaces = (): Place[] => {
    // For now, return mock selling places based on the item type
    // In the future, this could be populated from API data
    return [
      {
        id: "selling-1",
        name: "eBay",
        type: "selling",
        address: "Online Marketplace",
        website: "https://ebay.com",
        rating: 4.4,
        distance: "Online",
        description: "Global marketplace with millions of buyers",
        specialInstructions: "Free listing for first 50 items per month",
      },
      {
        id: "selling-2",
        name: "Facebook Marketplace",
        type: "selling",
        address: "Local Community",
        website: "https://facebook.com/marketplace",
        rating: 4.1,
        distance: "Local",
        description: "Local buying and selling in your community",
        specialInstructions: "No fees for local sales. Meet in public places.",
      },
      {
        id: "selling-3",
        name: "OfferUp",
        type: "selling",
        address: "Mobile App",
        website: "https://offerup.com",
        rating: 4.2,
        distance: "Local",
        description: "Mobile-first marketplace for local transactions",
        specialInstructions: "Instant offers available for electronics",
      },
    ];
  };

  const getPlacesForType = (
    type: "selling" | "donation" | "recycling"
  ): Place[] => {
    switch (type) {
      case "selling":
        return getSellingPlaces();
      case "donation":
        return mockDonationPlaces;
      case "recycling":
        return mockRecyclingPlaces;
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

    // Simulate API call to save the choice
    await new Promise((resolve) => setTimeout(resolve, 1000));

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
        {getPlacesForType(selectedType).map((place) => (
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

                {place.type !== "selling" && (
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
        ))}
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
