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

export interface AnalysisResponse {
  item: string;
  value: number;
  ecoImpact: string;
  confidence?: number;
}

export interface UserStats {
  totalValueUnlocked: number;
  totalCO2Saved: string;
  itemsScanned: number;
  badges: string[];
}

export type RootStackParamList = {
  Home: undefined;
  Results: { item: ScannedItem };
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
