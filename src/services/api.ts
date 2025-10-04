import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScannedItem } from "../types";

const API_URL = "http://localhost:5001"; // Change to your actual backend URL

export class ApiService {
    // Get auth token from storage
    private static async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem("authToken");
        } catch (error) {
            console.error("Error getting token:", error);
            return null;
        }
    }

    // Save auth token
    static async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem("authToken", token);
        } catch (error) {
            console.error("Error saving token:", error);
        }
    }

    // Clear auth token
    static async clearToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem("authToken");
        } catch (error) {
            console.error("Error clearing token:", error);
        }
    }

    // Analyze item (works with or without auth)
    static async analyzeItem(
        imageUri?: string,
        description?: string
    ): Promise<any> {
        const formData = new FormData();

        if (imageUri) {
            const uriParts = imageUri.split(".");
            const fileType = uriParts[uriParts.length - 1];

            formData.append("image", {
                uri: imageUri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        if (description) {
            formData.append("description", description);
        }

        const token = await this.getToken();
        const headers: any = {
            "Content-Type": "multipart/form-data",
        };

        // Include token if available (for authenticated users)
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Analysis failed");
        }

        return response.json();
    }

    // Get scanned items history (requires auth)
    static async getHistory(): Promise<ScannedItem[]> {
        const token = await this.getToken();

        if (!token) {
            console.log("No token - returning empty history");
            return [];
        }

        const response = await fetch(`${API_URL}/scanned-items`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch history");
        }

        const items = await response.json();

        // Transform backend data to frontend format
        return items.map((item: any) => ({
            id: item._id,
            name: item.itemName,
            value: item.estimatedValue,
            ecoImpact: item.ecoImpact.description,
            imageUri: item.images?.[0]?.url,
            timestamp: new Date(item.createdAt),
            action: item.status === 'listed' ? 'sell' :
                item.status === 'donated' ? 'donate' :
                    item.status === 'sold' ? 'sell' : undefined,
        }));
    }

    // Save/update item with action (requires auth)
    static async saveItem(item: ScannedItem): Promise<void> {
        const token = await this.getToken();

        if (!token) {
            console.log("No token - cannot save item");
            return;
        }

        // Update the item status based on action
        const status = item.action === 'sell' ? 'listed' :
            item.action === 'donate' ? 'donated' :
                item.action === 'recycle' ? 'kept' : 'scanned';

        const response = await fetch(`${API_URL}/scanned-items/${item.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to save item");
        }
    }

    // Get user profile with stats (requires auth)
    static async getProfile(): Promise<any> {
        const token = await this.getToken();

        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch profile");
        }

        return response.json();
    }

    // Get dashboard stats (requires auth)
    static async getDashboard(): Promise<any> {
        const token = await this.getToken();

        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch dashboard");
        }

        return response.json();
    }

    // Get suggestions for sell/donate/recycle
    static async getSuggestions(
        itemName: string,
        action: "sell" | "donate" | "recycle",
        category?: string,
        estimatedValue?: number
    ): Promise<any> {
        const response = await fetch(`${API_URL}/suggestions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                itemName,
                action,
                category,
                estimatedValue,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get suggestions");
        }

        return response.json();
    }

    // Login
    static async login(email: string, password: string): Promise<any> {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Login failed");
        }

        const data = await response.json();
        await this.saveToken(data.token);
        return data;
    }

    // Register
    static async register(
        name: string,
        email: string,
        password: string
    ): Promise<any> {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Registration failed");
        }

        const data = await response.json();
        await this.saveToken(data.token);
        return data;
    }

    // Logout
    static async logout(): Promise<void> {
        await this.clearToken();
    }
}