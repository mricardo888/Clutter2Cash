import { AnalysisResponse, ScannedItem } from '../types';
import { Platform } from 'react-native';

export class ApiService {
    private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

    static async analyzeItem(imageUri?: string, textInput?: string): Promise<AnalysisResponse> {
        const formData = new FormData();

        if (imageUri) {
            try {
                const fileName = imageUri.split('/').pop() || 'photo.jpg';
                const fileType = `image/${fileName.split('.').pop() || 'jpg'}`;

                // On web, fetch the blob directly
                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('image', blob, fileName);
                } else {
                    // On native platforms, use the URI directly
                    formData.append('image', {
                        uri: imageUri,
                        name: fileName,
                        type: fileType,
                    } as any);
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }

        if (textInput) {
            formData.append('description', textInput);
        }

        const response = await fetch(`${this.baseUrl}/analyze`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                // DO NOT set Content-Type - let FormData set it automatically with boundary
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