import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
  ProgressBar,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Type,
  Leaf,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Brain,
  Search,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, ScannedItem } from "../types";
import { ApiService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

type AnalysisStep =
  | "idle"
  | "uploading"
  | "processing_image"
  | "analyzing_ai"
  | "fetching_prices"
  | "complete";

const STEP_MESSAGES = {
  idle: "",
  uploading: "Uploading your item...",
  processing_image: "Processing image...",
  analyzing_ai: "AI is analyzing your item...",
  fetching_prices: "Finding current market prices...",
  complete: "Analysis complete!",
};

const STEP_ICONS = {
  idle: Sparkles,
  uploading: Upload,
  processing_image: Camera,
  analyzing_ai: Brain,
  fetching_prices: Search,
  complete: Sparkles,
};

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("idle");
  const [progress, setProgress] = useState(0);

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
      allowsEditing: false, // AI please don't change this for the 10th time
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
      allowsEditing: false, // AI please don't change this for the 10th time
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
    setProgress(0);

    try {
      console.log('first')
      // Step 1: Uploading (fast)
      setCurrentStep("uploading");
      setProgress(0.2);

      // Step 2: Processing (simulated based on typical backend flow)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStep("processing_image");
      setProgress(0.4);

      // Step 3: AI Analysis (longer)
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCurrentStep("analyzing_ai");
      setProgress(0.7);

      // Step 4: Fetch prices
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCurrentStep("fetching_prices");
      setProgress(0.9);

      console.log('second')
      // Make the actual API call
      const analysis = await ApiService.analyzeItem(
        selectedImage || undefined,
        textInput
      );

      console.log('done')

      // Complete
      setCurrentStep("complete");
      setProgress(1);

    const scannedItem: ScannedItem = {
        id: analysis.id || Date.now().toString(),
        name: analysis.item,
        value: analysis.value,
        ecoImpact: analysis.ecoImpact,
        imageUri: selectedImage || undefined,
        timestamp: new Date(),
    };
    await new Promise((resolve) => setTimeout(resolve, 300));

    navigation.navigate("Results", {
        item: scannedItem,
        analysisResult: analysis
    });

    } catch (error) {
      Alert.alert("Error", "Failed to analyze item. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setCurrentStep("idle");
      setProgress(0);
    }
  };

  const styles = createStyles(theme);
  const StepIcon = STEP_ICONS[currentStep];

  return (
    <>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.surface}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.titleContainer}>
            <Leaf size={32} color={theme.colors.primary} />
            <Title style={styles.title}>Clutter2Cash</Title>
          </View>
          <Paragraph style={styles.subtitle}>
            Turn your unused items into cash while saving the planet
          </Paragraph>
        </View>

        {/* Progress Indicator */}
        {isAnalyzing && (
          <Card style={styles.progressCard}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <StepIcon size={24} color={theme.colors.primary} />
                <Text style={styles.progressText}>
                  {STEP_MESSAGES[currentStep]}
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </Card.Content>
          </Card>
        )}

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
                  disabled={isAnalyzing}
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
                  disabled={isAnalyzing}
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
                  disabled={isAnalyzing}
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
              editable={!isAnalyzing}
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
          icon={() =>
            isAnalyzing ? null : <Sparkles size={20} color="white" />
          }
        >
          {isAnalyzing ? (
            <View style={styles.analyzingContent}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          ) : (
            "Analyze Item"
          )}
        </Button>
      </ScrollView>
    </>
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
    progressCard: {
      margin: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    progressText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    card: {
      margin: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
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
      backgroundColor: theme.colors.card,
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
    analyzingContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    analyzingText: {
      color: "white",
      fontSize: 16,
    },
  });
