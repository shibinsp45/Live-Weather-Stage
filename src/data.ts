import { WeatherStation } from "./types";

export const WEATHER_STATIONS: WeatherStation[] = [
  {
    id: "reykjavik",
    cityName: "Reykjavik",
    country: "Iceland",
    temperature: -5,
    humidity: 88,
    windSpeed: 24,
    pressure: 1008,
    condition: "Snowy",
    badgeText: "Glacial Arctic Front",
    history: [
      { label: "Mon", temp: -8 },
      { label: "Tue", temp: -7 },
      { label: "Wed", temp: -5 },
      { label: "Thu", temp: -9 },
      { label: "Fri", temp: -6 },
      { label: "Sat", temp: -4 },
      { label: "Sun", temp: -5 }
    ]
  },
  {
    id: "cappadocia",
    cityName: "Cappadocia",
    country: "Turkey",
    temperature: 16,
    humidity: 42,
    windSpeed: 8,
    pressure: 1016,
    condition: "Festive",
    badgeText: "Perfect Hot Air Lift",
    history: [
      { label: "Mon", temp: 12 },
      { label: "Tue", temp: 14 },
      { label: "Wed", temp: 15 },
      { label: "Thu", temp: 13 },
      { label: "Fri", temp: 17 },
      { label: "Sat", temp: 16 },
      { label: "Sun", temp: 16 }
    ]
  },
  {
    id: "st-moritz",
    cityName: "St. Moritz",
    country: "Switzerland",
    temperature: -2,
    humidity: 92,
    windSpeed: 15,
    pressure: 1005,
    condition: "Snowy",
    badgeText: "High Alpine Pass",
    history: [
      { label: "Mon", temp: -4 },
      { label: "Tue", temp: -3 },
      { label: "Wed", temp: -5 },
      { label: "Thu", temp: -2 },
      { label: "Fri", temp: -1 },
      { label: "Sat", temp: -3 },
      { label: "Sun", temp: -2 }
    ]
  },
  {
    id: "albuquerque",
    cityName: "Albuquerque",
    country: "United States",
    temperature: 24,
    humidity: 32,
    windSpeed: 6,
    pressure: 1019,
    condition: "Festive",
    badgeText: "Great Balloon Fiesta",
    history: [
      { label: "Mon", temp: 22 },
      { label: "Tue", temp: 25 },
      { label: "Wed", temp: 26 },
      { label: "Thu", temp: 23 },
      { label: "Fri", temp: 24 },
      { label: "Sat", temp: 27 },
      { label: "Sun", temp: 24 }
    ]
  },
  {
    id: "tokyo",
    cityName: "Kyoto",
    country: "Japan",
    temperature: 12,
    humidity: 60,
    windSpeed: 10,
    pressure: 1013,
    condition: "Clear",
    badgeText: "Moderate Autumn Vibe",
    history: [
      { label: "Mon", temp: 10 },
      { label: "Tue", temp: 11 },
      { label: "Wed", temp: 13 },
      { label: "Thu", temp: 12 },
      { label: "Fri", temp: 14 },
      { label: "Sat", temp: 13 },
      { label: "Sun", temp: 12 }
    ]
  }
];
