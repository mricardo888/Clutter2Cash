import { AnalysisResponse, ScannedItem } from '../types';
import * as FileSystem from 'expo-file-system';

export class ApiService {
  // Use tunnel URL from environment or fallback
  private static baseUrl =
    process.env.EXPO_PUBLIC_API_URL || 'https://xxxxxxx.exp.direct';

  // Analyze item from image or text
  static async analyzeItem(
    imageUri?: string,
    textInput?: string
  ): Promise<AnalysisResponse> {
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

    // Note: Do NOT set 'Content-Type' manually with FormData in Expo
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Analyze request failed:', errText);
      throw new Error('Failed to analyze item.');
    }

    const data = await response.json();
    return data as AnalysisResponse;
  }

  // --- Optional: Keep history and save methods ---
  static async getHistory(): Promise<ScannedItem[]> {
    const response = await fetch(`${this.baseUrl}/history`);
    if (!response.ok) throw new Error('Failed to get history');
    return (await response.json()) as ScannedItem[];
  }

  static async saveItem(item: ScannedItem): Promise<void> {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to save item');
  }
}
