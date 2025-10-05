export interface ScannedItem {
    id: string;
    name: string;
    value: number;
    ecoImpact: string;
    imageUri?: string;
    brand?: string;
    model?: string;
    action?: "sell" | "donate" | "recycle";
    timestamp: Date;
}

export interface ActionPlaces {
    selling?: any[];
    donation?: any[];
    recycling?: any[];
}

export interface AnalysisResponse {
    id?: string;
    item: string;
    value: number;
    ecoImpact: string;
    confidence?: string;
    category?: string;
    timestamp?: string;
    saved?: boolean;
    isGuest?: boolean;
    actionPlaces?: ActionPlaces;
}

export interface UserStats {
    totalValueUnlocked: number;
    totalCO2Saved: string;
    itemsScanned: number;
    badges: string[];
}

export type RootStackParamList = {
    Home: undefined;
    Results: {
        item: ScannedItem;
        analysisResult?: any; // Add this
    };
    ActionPlaces: {
        item: ScannedItem;
        actionPlaces?: any; // Add this
    };
    Dashboard: undefined;
    Profile: undefined;
    Login: undefined;
};

export type TabParamList = {
    HomeTab: undefined;
    DashboardTab: undefined;
    ProfileTab: undefined;
    LoginTab: undefined;
};