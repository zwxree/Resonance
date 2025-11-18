
export enum Tab {
  Home = 'home',
  Devices = 'devices',
  Hub = 'hub',
  Stats = 'stats',
  AI = 'ai',
}

export type Screen = { type: 'tab', tab: Tab };

export interface Device {
  id: string;
  name: string;
  room: string;
  isOn: boolean;
  consumption: number;
  status: 'optimal' | 'disconnected';
  priority: boolean;
  customVoltage?: number; // User-defined voltage for this chip
  maxVoltage: number; // Safety limit for the chip
}

export interface UsageData {
  name: string;
  consumption: number;
}

export interface Plan {
    id: string;
    name: string;
    price: string;
    kwhLimit: number;
    features: string[];
    tier: 'basic' | 'standard' | 'premium';
}
