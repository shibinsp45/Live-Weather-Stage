export interface SnowflakeItem {
  id: string;
  left: number; // percentage across screen (0 - 100)
  size: number; // size in pixels
  duration: number; // fall duration in seconds
  delay: number; // stagger delay in seconds
  opacity: number;
}

export interface BalloonItem {
  id: string;
  left: number; // percentage across screen ($0 - 100)
  sizeMultiplier: number; // relative size multiplier around medium (e.g. 0.8 - 1.2)
  duration: number; // float duration in seconds
  delay: number; // stagger delay in seconds
  color: string; // Tailwind color class or specific hex/HSL
  swayRange: number; // wiggle offset
}

export interface WeatherStation {
  id: string;
  cityName: string;
  country: string;
  temperature: number; // in °C
  humidity: number; // %
  windSpeed: number; // km/h
  pressure: number; // hPa
  condition: "Snowy" | "Festive" | "Clear" | "Breezy";
  badgeText: string;
  history?: { label: string; temp: number }[];
}
