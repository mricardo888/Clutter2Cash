import { AnalysisResponse, ScannedItem } from '../types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';

export class ApiService {
    private static baseUrl: string = "https://loreen-unpredestined-jodee.ngrok-free.dev";

    // Get stored auth token
    private static async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(TOKEN_KEY);
    }

    // Register new user
    static async register(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        // Save token
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
        return data;
    }

    // Login user
    static async login(email: string, password: string): Promise<{ token: string; user: any }> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        // Save token
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
        return data;
    }

    // Logout
    static async logout(): Promise<void> {
        await AsyncStorage.removeItem(TOKEN_KEY);
    }

    // Analyze item (requires authentication)
    static async analyzeItem(imageUri?: string, textInput?: string): Promise<AnalysisResponse> {
        const token = await this.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const formData = new FormData();
        console.log(this.baseUrl)
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
                'Authorization': `Bearer ${token}`,
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
        const token = await this.getToken();
        if (!token) {
            return [];
        }

        const response = await fetch(`${this.baseUrl}/scanned-items`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
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
        const token = await this.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
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
        const token = await this.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
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
        const token = await this.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
        const token = await this.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
    }

    // Check if user is authenticated
    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    }

    // Legacy method - no longer needed but kept for compatibility
    static async saveItem(item: ScannedItem): Promise<void> {
        // Items are now saved automatically by the /analyze endpoint
        // This method is kept for backward compatibility but does nothing
        console.log('Item saved via /analyze endpoint');
    }

    // Legacy methods - kept for compatibility
    static async clearHistory(): Promise<void> {
        console.warn('clearHistory is deprecated - items are stored in MongoDB');
    }
}