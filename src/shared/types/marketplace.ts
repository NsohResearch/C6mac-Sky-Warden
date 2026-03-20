export interface MarketplaceApp {
  id: string;
  name: string;
  publisher: string;
  publisherVerified: boolean;
  category: 'hardware_integration' | 'data_analytics' | 'mapping' | 'compliance' | 'communication' | 'weather' | 'insurance' | 'training' | 'reporting' | 'automation';
  description: string;
  shortDescription: string;
  icon: string;
  screenshots: string[];
  version: string;
  lastUpdated: string;
  rating: number;
  reviewCount: number;
  installs: number;
  pricing: { type: 'free' | 'paid' | 'freemium' | 'subscription'; price?: number; trialDays?: number };
  compatibility: string[];
  features: string[];
  permissions: string[];
  supportUrl: string;
  documentationUrl: string;
  status: 'available' | 'installed' | 'update_available';
  installedVersion?: string;
}

export interface MarketplaceStats {
  totalApps: number;
  installedApps: number;
  updatesAvailable: number;
  categoryCounts: Record<string, number>;
}
