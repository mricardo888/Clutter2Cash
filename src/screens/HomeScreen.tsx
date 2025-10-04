import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
} from "react-native";
import {
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Type,
  Leaf,
  Image as ImageIcon,
  Sparkles,
  DollarSign,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, ScannedItem } from "../types";
import { ApiService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera permissions to take photos!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeItem = async () => {
    if (!selectedImage && !textInput.trim()) {
      Alert.alert(
        "Input Required",
        "Please upload a photo or enter item details."
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await ApiService.analyzeItem(
        selectedImage || undefined,
        textInput
      );

      const scannedItem: ScannedItem = {
        id: Date.now().toString(),
        name: analysis.item,
        value: analysis.value,
        ecoImpact: analysis.ecoImpact,
        imageUri: selectedImage || undefined,
        timestamp: new Date(),
      };

      navigation.navigate("Results", { item: scannedItem });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze item. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Leaf size={32} color={theme.colors.primary} />
          <Title style={styles.title}>Clutter2Cash</Title>
        </View>
        <Paragraph style={styles.subtitle}>
          Turn your unused items into cash while saving the planet
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Camera size={24} color={theme.colors.primary} />
            <Title style={styles.cardTitle}>Upload Photo</Title>
          </View>
          <Paragraph style={styles.cardDescription}>
            Take or select a photo of your item for AI analysis
          </Paragraph>

          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <Button
                mode="outlined"
                onPress={() => setSelectedImage(null)}
                style={styles.removeButton}
              >
                Remove Photo
              </Button>
            </View>
          ) : (
            <View style={styles.photoButtonsContainer}>
              <Button
                mode="contained"
                onPress={takePhoto}
                style={styles.photoButton}
                icon={() => <Camera size={20} color="white" />}
              >
                Take Photo
              </Button>
              <Button
                mode="outlined"
                onPress={pickImage}
                style={styles.photoButton}
                icon={() => (
                  <ImageIcon size={20} color={theme.colors.primary} />
                )}
              >
                Choose from Gallery
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Type size={24} color={theme.colors.primary} />
            <Title style={styles.cardTitle}>Enter Item Details</Title>
          </View>
          <Paragraph style={styles.cardDescription}>
            Or type the brand and model of your item
          </Paragraph>

          <TextInput
            style={styles.textInput}
            placeholder="e.g., iPhone 11, MacBook Air, Samsung Galaxy..."
            placeholderTextColor={theme.colors.placeholder}
            value={textInput}
            onChangeText={setTextInput}
            multiline
          />
        </Card.Content>
      </Card>

      <Card style={styles.ecoCard}>
        <Card.Content>
          <View style={styles.ecoContent}>
            <Leaf size={24} color={theme.colors.primary} />
            <View style={styles.ecoText}>
              <Text style={styles.ecoTitle}>Eco Impact</Text>
              <Text style={styles.ecoDescription}>
                Every item you sell, donate, or recycle helps reduce waste and
                saves precious resources!
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={analyzeItem}
        disabled={isAnalyzing || (!selectedImage && !textInput.trim())}
        style={styles.analyzeButton}
        contentStyle={styles.analyzeButtonContent}
        icon={() => (isAnalyzing ? null : <Sparkles size={20} color="white" />)}
      >
        {isAnalyzing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          "Analyze Item"
        )}
      </Button>
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
      marginBottom: theme.spacing.md,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    card: {
      margin: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 20,
    },
    imageContainer: {
      alignItems: "center",
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 8,
      marginBottom: theme.spacing.md,
    },
    photoButtonsContainer: {
      gap: theme.spacing.md,
    },
    photoButton: {
      marginTop: theme.spacing.sm,
    },
    removeButton: {
      marginTop: theme.spacing.sm,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: theme.spacing.md,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: "top",
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
    },
    ecoCard: {
      margin: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    ecoContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    ecoText: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    ecoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    ecoDescription: {
      fontSize: 14,
      color: theme.colors.text,
    },
    analyzeButton: {
      margin: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    analyzeButtonContent: {
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
  });
