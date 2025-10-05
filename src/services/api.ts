import { AnalysisResponse, ScannedItem } from '../types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ApiService {
    private static baseUrl: string = "https://loreen-unpredestined-jodee.ngrok-free.dev";
    private static accessToken: string | null = null;
    private static isGuest: boolean = false;

    // Initialize - get token from storage or create guest
    static async initialize(): Promise<void> {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const guestStatus = await AsyncStorage.getItem('isGuest');

            if (storedToken) {
                this.accessToken = storedToken;
                this.isGuest = guestStatus === 'true';
                console.log('📱 Restored session:', this.isGuest ? 'Guest' : 'Registered');
            } else {
                // Create guest session if no token exists
                await this.createGuestSession();
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            await this.createGuestSession();
        }
    }

    // Create guest session
    static async createGuestSession(): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': '1234',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to create guest session');
            }

            const data = await response.json();
            this.accessToken = data.token;
            this.isGuest = true;

            await AsyncStorage.setItem('authToken', data.token);
            await AsyncStorage.setItem('isGuest', 'true');

            console.log('👤 Guest session created');
        } catch (error) {
            console.error('Failed to create guest session:', error);
            throw error;
        }
    }

    // Set access token (for registered users)
    static async setAccessToken(token: string, isGuest: boolean = false) {
        this.accessToken = token;
        this.isGuest = isGuest;

        try {
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('isGuest', isGuest.toString());
        } catch (error) {
            console.error('Failed to save token:', error);
        }
    }

    // Get current auth status
    static getAuthStatus(): { isAuthenticated: boolean; isGuest: boolean } {
        return {
            isAuthenticated: !!this.accessToken,
            isGuest: this.isGuest,
        };
    }

    // Clear auth (logout)
    static async clearAuth(): Promise<void> {
        this.accessToken = null;
        this.isGuest = false;
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('isGuest');
            // Create new guest session after logout
            await this.createGuestSession();
        } catch (error) {
            console.error('Failed to clear auth:', error);
        }
    }

    // Ensure we have a token (create guest if needed)
    private static async ensureToken(): Promise<string> {
        if (!this.accessToken) {
            await this.initialize();
        }
        if (!this.accessToken) {
            throw new Error('Failed to establish session');
        }
        return this.accessToken;
    }

    // Register new user (from guest or fresh)
    static async register(name: string, email: string, password: string): Promise<any> {
        const endpoint = this.isGuest ? '/convert-guest' : '/register';

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.accessToken || '',
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        await this.setAccessToken(data.token, false);

        return data;
    }

    // Login existing user
    static async login(email: string, password: string): Promise<any> {
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

        // If there was a guest session, we could optionally merge data here
        // For now, just switch to the logged-in account
        await this.setAccessToken(data.token, false);

        return data;
    }

    // Analyze item (works for both guest and registered users)
    static async analyzeItem(imageUri?: string, textInput?: string): Promise<AnalysisResponse> {
        const token = await this.ensureToken();

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
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to analyze item.');
        }

        const data = await response.json();

        // If a new guest token was created, save it
        if (data.guestToken) {
            await this.setAccessToken(data.guestToken, true);
        }

        return data as AnalysisResponse;
    }

    // Get scanned items from backend (works for both guest and registered)
    static async getHistory(): Promise<ScannedItem[]> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/scanned-items`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        const data = await response.json();

        // Handle both direct array response and object with items property
        const items = Array.isArray(data) ? data : (data.items || []);

        return items.map((item: any) => ({
            id: item._id,
            name: item.itemName,
            value: item.estimatedValue,
            ecoImpact: item.ecoImpact.description,
            imageUri: item.images?.[0]?.url,
            timestamp: new Date(item.createdAt),
            action: item.status === 'listed' ? 'sell' : item.status,
        }));
    }

    // Get single item by ID with full analysis data
    static async getItemById(itemId: string): Promise<any> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch item details');
        }

        return await response.json();
    }

    // Get user profile with stats (works for both guest and registered)
    static async getProfile(): Promise<any> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const profileData = await response.json();

        // Add local auth status to profile
        return {
            ...profileData,
            isGuest: this.isGuest,
        };
    }

    // Get dashboard stats (works for both guest and registered)
    static async getDashboard(): Promise<any> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard');
        }

        return await response.json();
    }

    // Update item (works for both guest and registered)
    static async updateItem(itemId: string, updates: Partial<any>): Promise<void> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update item');
        }
    }

    // Delete item (works for both guest and registered)
    static async deleteItem(itemId: string): Promise<void> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
    }

    // Mark item as listed
    static async markItemAsListed(itemId: string, price: number, platform: string, url?: string): Promise<void> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify({ price, platform, url }),
        });

        if (!response.ok) {
            throw new Error('Failed to mark item as listed');
        }
    }

    // Mark item as sold
    static async markItemAsSold(itemId: string, soldPrice: number): Promise<void> {
        const token = await this.ensureToken();

        const response = await fetch(`${this.baseUrl}/scanned-items/${itemId}/sold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'ngrok-skip-browser-warning': '1234',
            },
            body: JSON.stringify({ soldPrice }),
        });

        if (!response.ok) {
            throw new Error('Failed to mark item as sold');
        }
    }

    // Legacy method - kept for compatibility
    static async saveItem(item: ScannedItem): Promise<void> {
        console.log('Item saved via /analyze endpoint');
    }
}