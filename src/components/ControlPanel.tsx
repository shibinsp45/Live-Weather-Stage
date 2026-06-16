import { useState, useEffect } from "react";
import { 
  Snowflake, 
  Layers, 
  Trash2, 
  Clock, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass,
  Sun,
  Search,
  Loader2,
  Sparkles,
  RefreshCw,
  Umbrella,
  CloudLightning,
  CloudSnow,
  CloudSun
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WeatherStation } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ControlPanelProps {
  onTriggerSnowflakes: () => void;
  onTriggerBalloons: () => void;
  onClearAll: () => void;
  snowTimeRemaining: number;
  balloonTimeRemaining: number;
  selectedStation: WeatherStation;
  onSelectStation: (station: WeatherStation) => void;
  onTemperatureChange: (temp: number) => void;
  stations: WeatherStation[];
  onSearchCity: (cityName: string) => Promise<void>;
  isSearching: boolean;
  searchError: string | null;
  onClearSearchError: () => void;
}

export default function ControlPanel({
  onTriggerSnowflakes,
  onTriggerBalloons,
  onClearAll,
  snowTimeRemaining,
  balloonTimeRemaining,
  selectedStation,
  onSelectStation,
  onTemperatureChange,
  stations,
  onSearchCity,
  isSearching,
  searchError,
  onClearSearchError,
}: ControlPanelProps) {
  const [formattedTime, setFormattedTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchCity(searchQuery.trim());
      setSearchQuery("");
    }
  };

  // Keep a digital precision clock running
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setFormattedTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSnowActive = snowTimeRemaining > 0;
  const isBalloonActive = balloonTimeRemaining > 0;

  // Derive simple weather forecast parameters
  const weatherMode = selectedStation.temperature <= 0 
    ? "Freezing Snow ❄️" 
    : selectedStation.temperature > 15 
    ? "Warm Sunny Breeze 🎈" 
    : "Comfortable Temperate 🌤️";

  return (
    <div 
      id="control-panel-container"
      className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.15)] overflow-hidden z-30 transition-all duration-550"
    >
      {/* Top Active Ambient Status Line for visual progress */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 relative">
        <div 
          className="absolute top-0 bottom-0 left-0 bg-sky-400 transition-all duration-300"
          style={{ width: isSnowActive ? `${(snowTimeRemaining / 5) * 100}%` : "0%" }}
        />
        <div 
          className="absolute top-0 bottom-0 right-0 bg-rose-400 transition-all duration-300"
          style={{ width: isBalloonActive ? `${(balloonTimeRemaining / 5) * 100}%` : "0%" }}
        />
        {!isSnowActive && !isBalloonActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-rose-500/10" />
        )}
      </div>

      {/* Main Panel Content Container */}
      <div className="p-6 space-y-6">
        
        {/* Simplified Header Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Sun size={20} className="animate-spin" style={{ animationDuration: "14s" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display flex items-center gap-1.5">
                Live Weather Stage
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                Type any city to watch real-time conditions come alive
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold border border-slate-100 dark:border-slate-850 shadow-sm shrink-0">
            <Clock size={11} className="text-slate-400" />
            <span>{formattedTime || "00:00:00"}</span>
          </div>
        </div>

        {/* 1. Clean & Inviting Search Input */}
        <div className="space-y-1.5">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative">
              <input
                id="weather-city-search"
                type="text"
                placeholder="Search any city (e.g. Paris, Chicago, Siberia...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
                className="w-full pl-10 pr-24 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-550 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-75 transition-all font-medium"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                {isSearching ? (
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                ) : (
                  <Search size={14} />
                )}
              </div>
              
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-450 dark:disabled:text-slate-500 text-white text-xs font-sans font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>

          {/* Search error pop-up with clean dismissal feedback */}
          <AnimatePresence>
            {searchError && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl flex items-center justify-between gap-2 overflow-hidden"
              >
                <p className="text-xs text-rose-600 dark:text-rose-400 font-sans font-medium">
                  ⚠️ {searchError}
                </p>
                <button
                  type="button"
                  onClick={onClearSearchError}
                  className="text-[10px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100/40 dark:hover:bg-rose-950 font-mono font-bold px-2 py-1 rounded bg-white dark:bg-slate-900 border border-rose-200/50 hover:border-rose-300 dark:border-rose-900/50 focus:outline-none cursor-pointer"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Unified Meteorological Display (Primary Card) */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100/40 dark:border-indigo-900/20 p-5 rounded-2xl relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Left side: Big Temperature */}
            <div className="flex items-center gap-4">
              <div className="text-5xl font-extrabold tracking-tight text-indigo-900 dark:text-indigo-100 font-mono select-none">
                {selectedStation.temperature}°C
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                  Current Temperature
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                  {((selectedStation.temperature * 9/5) + 32).toFixed(0)}°F
                </span>
              </div>
            </div>

            {/* Right side: Station Location metadata */}
            <div className="sm:text-right">
              <div className="flex sm:justify-end items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-tight">
                <MapPin size={14} className="text-indigo-500" />
                <span>{selectedStation.cityName}</span>
              </div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                {selectedStation.country}
              </p>
              
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-55 bg-indigo-100/60 dark:bg-indigo-950/70 border border-indigo-200/30 dark:border-indigo-900/40 font-semibold text-[10px] text-indigo-700 dark:text-indigo-300">
                {weatherMode}
              </div>
            </div>

          </div>

          {/* Subtitle Badge description from live response */}
          <div className="mt-4 pt-3 border-t border-indigo-100/30 dark:border-indigo-900/20 text-xs text-slate-500 dark:text-slate-400 italic">
            💡 {selectedStation.badgeText || "Live localized pattern metrics active."}
          </div>

          {/* Clean 3-Column Weather Gauges */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dashed border-indigo-100/30 dark:border-indigo-900/20">
            <div className="bg-white/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-indigo-100/10 dark:border-indigo-900/10 flex flex-col items-center">
              <Droplets size={14} className="text-cyan-500 mb-1" />
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Humidity</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">{selectedStation.humidity}%</span>
            </div>
            
            <div className="bg-white/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-indigo-100/10 dark:border-indigo-900/10 flex flex-col items-center">
              <Wind size={14} className="text-sky-400 mb-1" />
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Wind</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">{selectedStation.windSpeed} km/h</span>
            </div>

            <div className="bg-white/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-indigo-100/10 dark:border-indigo-900/10 flex flex-col items-center">
              <Compass size={14} className="text-indigo-400 mb-1" />
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Pressure</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">{selectedStation.pressure} hPa</span>
            </div>
          </div>

        </div>

        {/* 3. Recharts 7-Day Temperature Trend Chart (Consolidated & Compact) */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-sans">
              7-Day Temperature Trend
            </span>
            <span className="text-[9px] font-mono text-indigo-500 font-medium">
              WEEKLY OUTLOOK
            </span>
          </div>

          <div className="w-full h-32 relative -ml-4 pr-1">
            {selectedStation.history && selectedStation.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedStation.history} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/40 dark:text-slate-800/40" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    dy={5}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    domain={["auto", "auto"]}
                    tickFormatter={(val) => `${val}°`}
                    dx={-4}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.95)", 
                      border: "none", 
                      borderRadius: "10px",
                      color: "#f8fafc",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.3)"
                    }}
                    labelFormatter={(label) => `${label} Day`}
                    formatter={(value: any) => [`${value}°C`, "Avg Temp"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    dot={{ r: 3, stroke: "#6366f1", strokeWidth: 1, fill: "#ffffff" }}
                    activeDot={{ r: 5, stroke: "#6366f1", strokeWidth: 1.5, fill: "#4f46e5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[11px] text-slate-400 font-sans">
                No matching outlook trend chart metrics.
              </div>
            )}
          </div>
        </div>

        {/* 4. Adjustable Atmosphere Climate Controller */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-sans font-bold tracking-wider uppercase">
            <div className="flex items-center gap-1">
              <Thermometer size={12} className="text-indigo-500" />
              <span>Interactive Weather Slider</span>
            </div>
            <span className="font-mono text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded text-[11px]">
              Set to {selectedStation.temperature}°C ({(selectedStation.temperature <= 0) ? "Freezing" : (selectedStation.temperature >= 15) ? "Warm" : "Mild"})
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-slate-400 font-mono">❄️ -10°C</span>
              <input
                id="temperature-slider"
                type="range"
                min="-10"
                max="35"
                value={selectedStation.temperature}
                onChange={(e) => onTemperatureChange(Number(e.target.value))}
                className="flex-grow h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors"
              />
              <span className="text-[10px] font-semibold text-rose-500 font-mono">☀️ 35°C</span>
            </div>

            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 text-center font-medium leading-relaxed">
              👉 <strong className="text-sky-500 dark:text-sky-450">Below 0°C</strong> triggers instant snow! <strong className="text-rose-500 dark:text-rose-450">Above 15°C</strong> sets warm air for interactive balloons!
            </p>
          </div>
        </div>

        {/* 5. Direct Interactive Magic Effects Panel (The Big Action Buttons) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Sparkles size={12} className="text-indigo-400" />
            <span>Interactive Atmosphere Triggers</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            {/* Trigger 1: Snow */}
            <motion.button
              id="btn-trigger-snowflakes"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onTriggerSnowflakes}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isSnowActive
                  ? "bg-sky-500/10 dark:bg-sky-500/5 border-sky-400 text-sky-600 dark:text-sky-300 font-bold"
                  : "bg-white hover:bg-slate-50 dark:bg-slate-900/40 border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              }`}
            >
              {isSnowActive && (
                <motion.div
                  initial={{ transformOrigin: "left" }}
                  animate={{ scaleX: snowTimeRemaining / 5 }}
                  className="absolute inset-0 bg-sky-200/10 dark:bg-sky-400/5 origin-left pointer-events-none"
                  transition={{ ease: "linear" }}
                />
              )}
              <div className="flex items-center gap-1.5 z-10 text-xs">
                <Snowflake size={14} className={isSnowActive ? "animate-[spin_4s_linear_infinite] text-sky-400" : "text-sky-400"} />
                <span>🌨️ Fall Snow</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-1 z-10">
                {isSnowActive ? `${snowTimeRemaining.toFixed(1)}s running` : "Click to start (5s)"}
              </span>
            </motion.button>

            {/* Trigger 2: Balloons */}
            <motion.button
              id="btn-trigger-balloons"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onTriggerBalloons}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isBalloonActive
                  ? "bg-rose-500/10 dark:bg-rose-500/5 border-rose-400 text-rose-600 dark:text-rose-300 font-bold"
                  : "bg-white hover:bg-slate-50 dark:bg-slate-900/40 border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              }`}
            >
              {isBalloonActive && (
                <motion.div
                  initial={{ transformOrigin: "left" }}
                  animate={{ scaleX: balloonTimeRemaining / 5 }}
                  className="absolute inset-0 bg-rose-200/10 dark:bg-rose-400/5 origin-left pointer-events-none"
                  transition={{ ease: "linear" }}
                />
              )}
              <div className="flex items-center gap-1.5 z-10 text-xs">
                <Layers size={14} className={isBalloonActive ? "animate-[bounce_2s_infinite] text-rose-400" : "text-rose-400"} />
                <span>🎈 Float Balloons</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5 z-10">
                {isBalloonActive ? `${balloonTimeRemaining.toFixed(1)}s running` : "Click to start (5s)"}
              </span>
            </motion.button>

          </div>
        </div>

        {/* 6. Beginners Quick Presets Jump Bubble Chips */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-sans block">
            Beginner Favorites & Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {stations.map((station) => {
              const isCurrent = station.id === selectedStation.id;
              const isFreezing = station.temperature <= 0;
              return (
                <button
                  key={station.id}
                  id={`preset-bubble-${station.id}`}
                  onClick={() => onSelectStation(station)}
                  className={`px-3 py-1.5 text-[11px] rounded-full border cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-indigo-600 border-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/10"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  }`}
                >
                  {isFreezing ? "❄️" : "☀️"} {station.cityName} ({station.temperature}°C)
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Simplified Footer Controls */}
      <div className="bg-slate-50/80 dark:bg-slate-950/40 px-6 py-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-xs text-slate-500 font-sans">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
            (isSnowActive || isBalloonActive) ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
          }`} />
          <span>Stage Magic {(isSnowActive || isBalloonActive) ? "Running" : "Ready"}</span>
        </span>

        {(isSnowActive || isBalloonActive) && (
          <button
            id="btn-clear-simulations"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors font-bold cursor-pointer py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <Trash2 size={11} className="text-rose-500" />
            <span>Clear Effects</span>
          </button>
        )}
      </div>
    </div>
  );
}
