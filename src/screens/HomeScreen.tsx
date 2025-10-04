import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Type, Leaf } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ScannedItem } from '../types';
import { ApiService } from '../services/api';
import { theme, spacing } from '../utils/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeItem = async () => {
    if (!selectedImage && !textInput.trim()) {
      Alert.alert('Input Required', 'Please upload a photo or enter item details.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysis = await ApiService.analyzeItem(selectedImage || undefined, textInput);
      
      const scannedItem: ScannedItem = {
        id: Date.now().toString(),
        name: analysis.item,
        value: analysis.value,
        ecoImpact: analysis.ecoImpact,
        imageUri: selectedImage || undefined,
        timestamp: new Date(),
      };

      navigation.navigate('Results', { item: scannedItem });
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze item. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>🌱 Clutter2Cash</Title>
        <Paragraph style={styles.subtitle}>
          Turn your unused items into cash while saving the planet!
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>📸 Upload Photo</Title>
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
            <Button
              mode="contained"
              onPress={pickImage}
              style={styles.uploadButton}
              icon={() => <Camera size={20} color="white" />}
            >
              Choose Photo
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>⌨️ Enter Item Details</Title>
          <Paragraph style={styles.cardDescription}>
            Or type the brand and model of your item
          </Paragraph>
          
          <TextInput
            style={styles.textInput}
            placeholder="e.g., iPhone 11, MacBook Air, Samsung Galaxy..."
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
              <Text style={styles.ecoTitle}>🌍 Eco Impact</Text>
              <Text style={styles.ecoDescription}>
                Every item you sell, donate, or recycle helps reduce waste and saves precious resources!
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
      >
        {isAnalyzing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          'Analyze Item'
        )}
      </Button>
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text,
  },
  card: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
  },
  uploadButton: {
    marginTop: spacing.sm,
  },
  removeButton: {
    marginTop: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    borderRadius: theme.roundness,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ecoCard: {
    margin: spacing.md,
    backgroundColor: '#E8F5E8',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  ecoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  ecoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },
  ecoDescription: {
    fontSize: 14,
    color: theme.colors.text,
  },
  analyzeButton: {
    margin: spacing.lg,
    marginTop: spacing.md,
  },
  analyzeButtonContent: {
    paddingVertical: spacing.sm,
  },
});
