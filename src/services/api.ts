import { AnalysisResponse, ScannedItem } from '../types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@scanned_items';

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

    // Save an item to local storage
    static async saveItem(item: ScannedItem): Promise<void> {
        try {
            const existingItems = await this.getHistory();
            const updatedItems = [...existingItems, item];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        } catch (error) {
            console.error('Error saving item:', error);
            throw error;
        }
    }

    // Get all scanned items from local storage
    static async getHistory(): Promise<ScannedItem[]> {
        try {
            const itemsJson = await AsyncStorage.getItem(STORAGE_KEY);
            if (!itemsJson) {
                return [];
            }
            const items = JSON.parse(itemsJson);
            // Convert timestamp strings back to Date objects
            return items.map((item: any) => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    // Clear all history
    static async clearHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing history:', error);
            throw error;
        }
    }

    // Delete a specific item
    static async deleteItem(itemId: string): Promise<void> {
        try {
            const existingItems = await this.getHistory();
            const updatedItems = existingItems.filter(item => item.id !== itemId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }
}