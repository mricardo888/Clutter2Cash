import React, { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    Linking,
} from "react-native";
import {
    Button,
    Card,
    Title,
    Paragraph,
    Text,
    ActivityIndicator,
    List,
} from "react-native-paper";
import {
    DollarSign,
    Leaf,
    Share2,
    Heart,
    Recycle,
    Sparkles,
    TrendingUp,
    Store,
    MapPin,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, ScannedItem } from "../types";
import { ApiService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth0 } from "../contexts/Auth0Context";

type ResultsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Results"
>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, "Results">;

interface Props {
    navigation: ResultsScreenNavigationProp;
    route: ResultsScreenRouteProp;
}

interface Suggestions {
    hasOptions: boolean;
    message: string;
    suggestions: string[];
}

export default function ResultsScreen({ navigation, route }: Props) {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth0();
    const { item } = route.params;
    const [selectedAction, setSelectedAction] = useState<
        "sell" | "donate" | "recycle" | null
    >(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);

    const getSuggestions = async (action: "sell" | "donate" | "recycle") => {
        setLoadingSuggestions(true);
        try {
            const data = await ApiService.getSuggestions(
                item.name,
                action,
                "Electronics",
                item.value
            );
            setSuggestions(data);
        } catch (error) {
            console.error("Error getting suggestions:", error);
            setSuggestions({
                hasOptions: false,
                message: "Unable to load suggestions at this time.",
                suggestions: [],
            });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleAction = async (action: "sell" | "donate" | "recycle") => {
        setSelectedAction(action);

        // Get suggestions from Gemini
        await getSuggestions(action);

        // Save the item if authenticated
        if (isAuthenticated && item.id) {
            try {
                const updatedItem = { ...item, action };
                await ApiService.saveItem(updatedItem);
            } catch (error) {
                console.error("Error saving action:", error);
            }
        }
    };

    const handleDone = () => {
        const actionText = selectedAction || "take action on";
        Alert.alert(
            "Great Choice!",
            `You chose to ${actionText} your ${item.name}. ${
                !isAuthenticated
                    ? "Sign in to save your items and track your impact!"
                    : "This helps reduce waste and supports sustainability!"
            }`,
            [
                {
                    text: isAuthenticated ? "View History" : "Sign In",
                    onPress: () =>
                        navigation.navigate(isAuthenticated ? "Dashboard" : "Login"),
                },
                {
                    text: "Scan Another",
                    onPress: () => navigation.navigate("Home"),
                },
            ]
        );
    };

    const handleShare = async () => {
        try {
            await Linking.openURL(
                `https://example.com/share?item=${encodeURIComponent(
                    item.name
                )}&value=${item.value}`
            );
        } catch (error) {
            Alert.alert("Error", "Unable to open share link");
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case "sell":
                return <DollarSign size={20} color="white" />;
            case "donate":
                return <Heart size={20} color="white" />;
            case "recycle":
                return <Recycle size={20} color="white" />;
            default:
                return null;
        }
    };

    const getActionColor = (action: string) => {
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

    const styles = createStyles(theme);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Sparkles size={48} color={theme.colors.primary} />
                <Title style={styles.title}>Analysis Complete!</Title>
                <Paragraph style={styles.subtitle}>
                    Here's what we found about your item
                </Paragraph>

                {!isAuthenticated && (
                    <Card style={styles.warningCard}>
                        <Card.Content>
                            <Text style={styles.warningText}>
                                Sign in to save this item and track your impact over time!
                            </Text>
                        </Card.Content>
                    </Card>
                )}
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
                            <Text style={styles.statValue}>{item.ecoImpact}</Text>
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

                    <View style={styles.actionsContainer}>
                        <Button
                            mode="contained"
                            onPress={() => handleAction("sell")}
                            style={[
                                styles.actionButton,
                                { backgroundColor: theme.colors.success },
                            ]}
                            icon={() => getActionIcon("sell")}
                            disabled={selectedAction !== null}
                        >
                            Sell
                        </Button>

                        <Button
                            mode="contained"
                            onPress={() => handleAction("donate")}
                            style={[styles.actionButton, { backgroundColor: "#E91E63" }]}
                            icon={() => getActionIcon("donate")}
                            disabled={selectedAction !== null}
                        >
                            Donate
                        </Button>

                        <Button
                            mode="contained"
                            onPress={() => handleAction("recycle")}
                            style={[
                                styles.actionButton,
                                { backgroundColor: theme.colors.primary },
                            ]}
                            icon={() => getActionIcon("recycle")}
                            disabled={selectedAction !== null}
                        >
                            Recycle
                        </Button>
                    </View>
                </Card.Content>
            </Card>

            {selectedAction && (
                <Card style={styles.suggestionsCard}>
                    <Card.Content>
                        <View style={styles.suggestionsHeader}>
                            <Store size={24} color={theme.colors.primary} />
                            <Title style={styles.suggestionsTitle}>
                                Where to {selectedAction}
                            </Title>
                        </View>

                        {loadingSuggestions ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={styles.loadingText}>
                                    Finding the best places for you...
                                </Text>
                            </View>
                        ) : suggestions ? (
                            <>
                                {suggestions.hasOptions ? (
                                    <>
                                        <Paragraph style={styles.suggestionsDescription}>
                                            Here are some recommended places:
                                        </Paragraph>
                                        {suggestions.suggestions.map((suggestion, index) => (
                                            <List.Item
                                                key={index}
                                                title={suggestion}
                                                titleNumberOfLines={3}
                                                left={(props) => (
                                                    <MapPin
                                                        {...props}
                                                        size={20}
                                                        color={theme.colors.primary}
                                                    />
                                                )}
                                                style={styles.suggestionItem}
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <View style={styles.noOptionsContainer}>
                                        <Text style={styles.noOptionsText}>
                                            {suggestions.message}
                                        </Text>
                                    </View>
                                )}

                                <Button
                                    mode="contained"
                                    onPress={handleDone}
                                    style={styles.doneButton}
                                >
                                    Done
                                </Button>
                            </>
                        ) : null}
                    </Card.Content>
                </Card>
            )}

            {!selectedAction && (
                <>
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
                </>
            )}
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
        warningCard: {
            marginTop: 16,
            backgroundColor: theme.colors.accent + "20",
            borderWidth: 1,
            borderColor: theme.colors.accent,
        },
        warningText: {
            color: theme.colors.text,
            textAlign: "center",
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
        },
        statValue: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.colors.text,
            marginTop: 4,
            marginBottom: 4,
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
        actionsContainer: {
            gap: 16,
        },
        actionButton: {
            marginBottom: 12,
        },
        suggestionsCard: {
            margin: 16,
            marginBottom: 8,
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        suggestionsHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
        },
        suggestionsTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.colors.primary,
        },
        suggestionsDescription: {
            fontSize: 14,
            color: theme.colors.placeholder,
            marginBottom: 16,
        },
        loadingContainer: {
            alignItems: "center",
            paddingVertical: 32,
        },
        loadingText: {
            marginTop: 16,
            color: theme.colors.textSecondary,
        },
        suggestionItem: {
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        noOptionsContainer: {
            paddingVertical: 16,
        },
        noOptionsText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: "center",
            lineHeight: 20,
        },
        doneButton: {
            marginTop: 16,
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
            paddingBottom: 40,
        },
        footerButton: {
            flex: 1,
            marginHorizontal: 8,
        },
    });