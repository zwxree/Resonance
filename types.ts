
export enum Tab {
  Dashboard = 'dashboard',
  Devices = 'devices',
  Usage = 'usage',
  Store = 'store',
  ImageEditor = 'edit',
}

export type Screen = { type: 'tab', tab: Tab };

export interface Device {
  id: string;
  name: string;
  room: string;
  isOn: boolean;
  consumption: number;
}

export interface UsageData {
  name: string;
  consumption: number;
}
