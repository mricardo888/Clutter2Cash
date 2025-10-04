import { AnalysisResponse, ScannedItem } from '../types';
import * as FileSystem from 'expo-file-system';

export class ApiService {
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  static async analyzeItem(imageUri?: string, textInput?: string): Promise<AnalysisResponse> {
    const formData = new FormData();

    if (imageUri) {
      // Convert local URI to file for upload
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        const fileName = imageUri.split('/').pop() || 'photo.jpg';
        const fileType = `image/${fileName.split('.').pop() || 'jpg'}`;

        formData.append('image', {
          uri: imageUri,
          name: fileName,
          type: fileType,
        } as any);
      }
    }

    if (textInput) {
      formData.append('description', textInput);
    }

    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze item.');
    }

    const data = await response.json();
    return data as AnalysisResponse;
  }

}


/*import { AnalysisResponse, ScannedItem } from '../types';

// Mock data for demonstration
const mockAnalysisData: AnalysisResponse[] = [
  { item: 'iPhone 11', value: 180, ecoImpact: '30kg CO₂ saved', confidence: 0.95 },
  { item: 'MacBook Air 2020', value: 650, ecoImpact: '45kg CO₂ saved', confidence: 0.92 },
  { item: 'Samsung Galaxy S21', value: 220, ecoImpact: '25kg CO₂ saved', confidence: 0.88 },
  { item: 'Nintendo Switch', value: 200, ecoImpact: '15kg CO₂ saved', confidence: 0.90 },
  { item: 'iPad Air', value: 300, ecoImpact: '35kg CO₂ saved', confidence: 0.87 },
  { item: 'Dyson Vacuum', value: 150, ecoImpact: '20kg CO₂ saved', confidence: 0.85 },
  { item: 'Instant Pot', value: 80, ecoImpact: '12kg CO₂ saved', confidence: 0.83 },
  { item: 'AirPods Pro', value: 120, ecoImpact: '8kg CO₂ saved', confidence: 0.91 },
];

export class ApiService {
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  // Analyze item from image or text
  static async analyzeItem(imageUri?: string, textInput?: string): Promise<AnalysisResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response - in real app, this would call the backend
    const randomItem = mockAnalysisData[Math.floor(Math.random() * mockAnalysisData.length)];

    // If text input provided, try to match it
    if (textInput) {
      const matchedItem = mockAnalysisData.find(item =>
        item.item.toLowerCase().includes(textInput.toLowerCase()) ||
        textInput.toLowerCase().includes(item.item.toLowerCase())
      );
      if (matchedItem) {
        return matchedItem;
      }
    }

    return randomItem;
  }

  // Get user's scan history
  static async getHistory(): Promise<ScannedItem[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock history data
    return [
      {
        id: '1',
        name: 'iPhone 11',
        value: 180,
        ecoImpact: '30kg CO₂ saved',
        imageUri: 'https://via.placeholder.com/150',
        action: 'sell',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '2',
        name: 'MacBook Air 2020',
        value: 650,
        ecoImpact: '45kg CO₂ saved',
        imageUri: 'https://via.placeholder.com/150',
        action: 'donate',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: '3',
        name: 'Nintendo Switch',
        value: 200,
        ecoImpact: '15kg CO₂ saved',
        imageUri: 'https://via.placeholder.com/150',
        action: 'sell',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
    ];
  }

  // Save scanned item to history
  static async saveItem(item: ScannedItem): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app, this would save to backend
    console.log('Saving item:', item);
  }
}
  */
