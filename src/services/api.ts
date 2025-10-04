import { AnalysisResponse, ScannedItem } from '../types';
import { Platform } from 'react-native';

export class ApiService {
    private static baseUrl: string = "https://loreen-unpredestined-jodee.ngrok-free.dev";
    private static accessToken: string | null = null;

    // Set access token (called by Auth0Provider)
    static setAccessToken(token: string) {
        this.accessToken = token;
    }

    // Analyze item (requires authentication)
    static async analyzeItem(imageUri?: string, textInput?: string): Promise<AnalysisResponse> {
        if (!this.accessToken) {
            throw new Error('Authentication required');
        }

        const formData = new FormData();

        if (imageUri) {
            try {
                const fileName = imageUri.split('/').pop() || 'photo.jpg';
                const fileType = `image/${fileName.split('.').pop() || 'jpg'}`;

                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('image', blob, fileName);
                } else {
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
                'Authorization': `Bearer ${this.accessToken}`,
                'ngrok-skip-browser-warning': '1234',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to analyze item.');
        }

        const data = await response.json();
        return data as AnalysisResponse;
    }

    // Get scanned items from backend
    static async getHistory(): Promise<ScannedItem[]> {
        if (!this.accessToken) {
            return [];
        }

        const response = await fetch(`${this.baseUrl}/scanned-items`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        return data.map((item: any) => ({
            id: item._id,
            name: item.itemName,
            value: item.estimatedValue,
            ecoImpact: item.ecoImpact.description,
            imageUri: item.images?.[0]?.url,
            timestamp: new Date(item.createdAt),
            action: item.status === 'listed' ? 'sell' : item.status,
        }));
    }

    // Get user profile with stats
    static async getProfile(): Promise<any> {
        if (!this.accessToken) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return await response.json();
    }

    // Get dashboard stats
    static async getDashboard(): Promise<any> {
        if (!this.accessToken) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard');
        }

        return await response.json();
    }

    // Update item
    static async updateItem(itemId: string, updates: Partial<ScannedItem>): Promise<void> {
        if (!this.accessToken) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update item');
        }
    }

    // Delete item
    static async deleteItem(itemId: string): Promise<void> {
        if (!this.accessToken) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
    }

    // Legacy method - kept for compatibility
    static async saveItem(item: ScannedItem): Promise<void> {
        console.log('Item saved via /analyze endpoint');
    }
}