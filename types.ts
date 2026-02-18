export enum WeatherCondition {
  Sunny = 'Sunny',
  Rainy = 'Rainy',
  Cloudy = 'Cloudy',
  Stormy = 'Stormy'
}

export enum DayType {
  Weekday = 'Weekday',
  Weekend = 'Weekend'
}

export interface ParkingState {
  timeBlock: number; // 0-96 (15 min intervals)
  weather: WeatherCondition;
  dayType: DayType;
}

export interface ParkingDataPoint {
  date: string;
  time: string; // HH:mm
  timestamp: number;
  availability: number; // Available spots
  totalSpots: number;
  weather: WeatherCondition;
  dayType: DayType;
  rate: number; // Hourly rate
}

export interface QTableEntry {
  state: string; // Key: "Time-Weather-DayType"
  actions: number[]; // Array of Q-values for actions [Hold, IncreasePrice, DecreasePrice]
}

export interface PredictionResult {
  predictedAvailability: number;
  confidence: number;
  qValue: number;
  recommendedAction: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalSpots: number;
  currentAvailable: number;
  baseRate: number;
}