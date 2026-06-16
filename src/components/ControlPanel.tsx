import { useState, useEffect } from "react";
import { 
  Snowflake, 
  Layers, 
  Sparkles, 
  Trash2, 
  Clock, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass,
  Sliders,
  Flag,
  Sun,
  Activity,
  Search,
  Loader2
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
  const [activeTab, setActiveTab] = useState<"control" | "locations" | "instruments">("control");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchCity(searchQuery.trim());
      setSearchQuery("");
    }
  };

  // Keep a digital precision clock running on our station dashboard
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
    ? "Sub-Zero Freeze" 
    : selectedStation.temperature > 15 
    ? "High-Altitude Warmth" 
    : "Temperate Standard";

  return (
    <div 
      id="control-panel-container"
      className="w-full max-w-xl bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden z-30 transition-all duration-500"
    >
      {/* Top Multi-Color Active Ambient Status Line */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 relative">
        <div 
          className="absolute top-0 bottom-0 left-0 bg-sky-400 transition-all duration-300"
          style={{ width: isSnowActive ? `${(snowTimeRemaining / 5) * 100}%` : "0%" }}
        />
        <div 
          className="absolute top-0 bottom-0 right-0 bg-rose-400 transition-all duration-300"
          style={{ width: isBalloonActive ? `${(balloonTimeRemaining / 5) * 100}%` : "0%" }}
        />
        {/* Neutral background state indicator */}
        {!isSnowActive && !isBalloonActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/30 via-indigo-400/30 to-rose-400/30" />
        )}
      </div>

      {/* Main Station Header */}
      <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 space-y-4">
        {/* Row 1: Title and Clock */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-indigo-500">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display">
                  MetDesk FX
                </h2>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-wider font-semibold">
                  v3.5 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-sans flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-sky-400" />
                <span>Station: <strong>{selectedStation.cityName}, {selectedStation.country}</strong></span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200/50 dark:border-slate-700/50 shadow-sm shrink-0">
            <Clock size={12} className="text-slate-400" />
            <span>{formattedTime || "00:00:00"}</span>
          </div>
        </div>

        {/* Row 2: Search Unified Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search any worldwide city weather (e.g. London, Siberia, Cappadocia)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="w-full pl-10 pr-24 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-75 transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {isSearching ? (
                <Loader2 size={13} className="animate-spin text-indigo-500" />
              ) : (
                <Search size={13} />
              )}
            </div>
            
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-450 dark:disabled:text-slate-500 text-white text-[10px] font-sans font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isSearching ? "Loading" : "Analyze"}
              </button>
            </div>
          </div>
        </form>

        {/* Display searching errors with auto-cleanup dismiss button */}
        <AnimatePresence>
          {searchError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-2.5 rounded-lg flex items-center justify-between gap-2 overflow-hidden"
            >
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-sans font-medium">
                ⚠️ {searchError}
              </p>
              <button
                type="button"
                onClick={onClearSearchError}
                className="text-[10px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-200 hover:border-rose-300 dark:border-rose-900 focus:outline-none cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 px-4 pt-1 gap-1">
        <button
          id="tab-btn-control"
          onClick={() => setActiveTab("control")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "control"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Sliders size={14} />
          <span>Interactive Deck</span>
        </button>
        <button
          id="tab-btn-locations"
          onClick={() => setActiveTab("locations")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "locations"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <MapPin size={14} />
          <span>Global Forecasts</span>
        </button>
        <button
          id="tab-btn-instruments"
          onClick={() => setActiveTab("instruments")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "instruments"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Compass size={14} />
          <span>Weather Sensors</span>
        </button>
      </div>

      {/* Contents based on active tab */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "control" && (
            <motion.div
              key="tab-control-content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Climate Alert Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-500 mt-0.5">
                  <Sun size={15} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono tracking-wider font-semibold text-indigo-500 uppercase">
                    METEOROLOGICAL OUTLOOK
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Current stage condition is <span className="text-indigo-500 font-semibold">{weatherMode}</span> ({selectedStation.temperature}°C). 
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                    Trigger independent atmospheric effects below. High warmth triggers warm-thermal buoyancy (Balloons) while custom alpine freezes produce instant sub-zero crystallization (Snowflakes).
                  </p>
                </div>
              </div>

              {/* Primary Requirements Section: The Two Big Action Buttons */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                  <Sparkles size={11} className="text-indigo-400" />
                  <span>Manual Interactive Controls</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Snowflakes Button */}
                  <motion.button
                    id="btn-trigger-snowflakes"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onTriggerSnowflakes}
                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      isSnowActive
                        ? "bg-sky-500/10 dark:bg-sky-500/5 border-sky-400 text-sky-600 dark:text-sky-300 shadow-inner"
                        : "bg-gradient-to-b from-slate-50 to-slate-100/70 hover:from-slate-50 hover:to-slate-50 dark:from-slate-800/40 dark:to-slate-800/20 dark:hover:from-slate-800/80 dark:hover:to-slate-800/50 border-slate-200/80 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-sky-400/60 hover:shadow-lg hover:shadow-sky-500/5"
                    }`}
                  >
                    {/* Visual Progress bar overlay */}
                    {isSnowActive && (
                      <motion.div
                        initial={{ transformOrigin: "left" }}
                        animate={{ scaleX: snowTimeRemaining / 5 }}
                        className="absolute inset-0 bg-sky-200/20 dark:bg-sky-400/5 origin-left pointer-events-none"
                        transition={{ ease: "linear" }}
                      />
                    )}

                    <div className="z-10 flex flex-col items-center text-center">
                      <div className={`p-3 rounded-xl mb-3 transition-all duration-300 ${
                        isSnowActive 
                          ? "bg-sky-400 text-white shadow-md shadow-sky-400/20 rotate-[35deg]" 
                          : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-sky-500"
                      }`}>
                        <Snowflake size={22} className={isSnowActive ? "animate-[spin_4s_linear_infinite]" : ""} />
                      </div>
                      <span className="text-sm font-semibold tracking-tight">Snowflakes</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                        Fall for 5 Seconds
                      </p>
                      <span className={`inline-block py-0.5 px-2 rounded-full font-mono text-[9px] font-bold mt-2.5 transition-colors ${
                        isSnowActive ? "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300" : "bg-slate-100 dark:bg-slate-800/80 text-slate-400"
                      }`}>
                        {isSnowActive ? `${snowTimeRemaining.toFixed(1)}s active` : "TRIGGER"}
                      </span>
                    </div>
                  </motion.button>

                  {/* Balloons Button */}
                  <motion.button
                    id="btn-trigger-balloons"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onTriggerBalloons}
                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      isBalloonActive
                        ? "bg-rose-500/10 dark:bg-rose-500/5 border-rose-400 text-rose-600 dark:text-rose-300 shadow-inner"
                        : "bg-gradient-to-b from-slate-50 to-slate-100/70 hover:from-slate-50 hover:to-slate-50 dark:from-slate-800/40 dark:to-slate-800/20 dark:hover:from-slate-800/80 dark:hover:to-slate-800/50 border-slate-200/80 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-rose-400/60 hover:shadow-lg hover:shadow-rose-500/5"
                    }`}
                  >
                    {/* Visual Progress bar overlay */}
                    {isBalloonActive && (
                      <motion.div
                        initial={{ transformOrigin: "left" }}
                        animate={{ scaleX: balloonTimeRemaining / 5 }}
                        className="absolute inset-0 bg-rose-200/20 dark:bg-rose-400/5 origin-left pointer-events-none"
                        transition={{ ease: "linear" }}
                      />
                    )}

                    <div className="z-10 flex flex-col items-center text-center">
                      <div className={`p-3 rounded-xl mb-3 transition-all duration-300 ${
                        isBalloonActive 
                          ? "bg-rose-400 text-white shadow-md shadow-rose-400/20 translate-y-[-2px]" 
                          : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-rose-500"
                      }`}>
                        <Layers size={22} className={isBalloonActive ? "animate-[bounce_1.5s_infinite]" : ""} />
                      </div>
                      <span className="text-sm font-semibold tracking-tight">Balloons</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                        Float up for 5 Seconds
                      </p>
                      <span className={`inline-block py-0.5 px-2 rounded-full font-mono text-[9px] font-bold mt-2.5 transition-colors ${
                        isBalloonActive ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300" : "bg-slate-100 dark:bg-slate-800/80 text-slate-400"
                      }`}>
                        {isBalloonActive ? `${balloonTimeRemaining.toFixed(1)}s active` : "TRIGGER"}
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Climate Interaction Slider - Weather Style */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-sans font-semibold tracking-wider uppercase">
                  <div className="flex items-center gap-1.5">
                    <Thermometer size={12} className="text-indigo-500" />
                    <span>Dynamic Temperature Control</span>
                  </div>
                  <span className="font-mono text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded text-[11px]">
                    {selectedStation.temperature}°C ({((selectedStation.temperature * 9/5) + 32).toFixed(0)}°F)
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-cyan-500 font-mono">-10°C</span>
                    <input
                      id="temperature-slider"
                      type="range"
                      min="-10"
                      max="35"
                      value={selectedStation.temperature}
                      onChange={(e) => onTemperatureChange(Number(e.target.value))}
                      className="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-colors"
                    />
                    <span className="text-[10px] font-semibold text-rose-500 font-mono">35°C</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
                    <div className="p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <span className="font-bold text-sky-400 dark:text-sky-300">Below 0°C:</span> automatically triggers a snowfall atmosphere session.
                    </div>
                    <div className="p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <span className="font-bold text-rose-400 dark:text-rose-300">Above 15°C:</span> sets warm buoyant currents for floating balloons.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "locations" && (
            <motion.div
              key="tab-locations-content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1.5 font-sans mb-3">
                <MapPin size={12} className="text-indigo-400" />
                <span>Preset Meteorological Stations</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {stations.map((station) => {
                  const isCurrent = station.id === selectedStation.id;
                  const isFreezing = station.temperature <= 0;

                  return (
                    <motion.div
                      key={station.id}
                      id={`preset-station-card-${station.id}`}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onSelectStation(station)}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? "bg-slate-50 dark:bg-slate-800/50 border-indigo-500/80 shadow-md shadow-indigo-500/5"
                          : "bg-white hover:bg-slate-50/50 dark:bg-slate-900/40 dark:hover:bg-slate-800/20 border-slate-200 dark:border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg transition-colors ${
                          isFreezing 
                            ? "bg-sky-50 dark:bg-sky-950/50 text-sky-500 border border-sky-100 dark:border-sky-900" 
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-500 border border-rose-100 dark:border-rose-900"
                        }`}>
                          {isFreezing ? <Snowflake size={16} /> : <Flag size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 font-display">
                              {station.cityName}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                              {station.country}
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium font-sans">
                            {station.badgeText}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                          {station.temperature}°C
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                          {station.condition === "Snowy" ? "Atmospheric Snow" : station.condition === "Festive" ? "Aerial Fiesta" : "Temperate Panel"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed italic mt-4 font-sans border-t border-dashed border-slate-200 dark:border-slate-800/60 pt-3">
                * Note: Selecting a station automatically adapts the weather sensors and fires the corresponding atmospheric particle visualizer.
              </p>
            </motion.div>
          )}

          {activeTab === "instruments" && (
            <motion.div
              key="tab-instruments-content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 animate-fade-in"
            >
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1.5 font-sans mb-3">
                <Compass size={12} className="text-indigo-400" />
                <span>Instrument Readings</span>
              </div>

              {/* Interactive bento grid style weather stats */}
              <div className="grid grid-cols-3 gap-3">
                {/* Gauge 1: Humidity */}
                <div id="sensor-humidity" className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 rounded-lg mb-2">
                    <Droplets size={16} />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                    HUMIDITY
                  </span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">
                    {selectedStation.humidity}%
                  </span>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${selectedStation.humidity}%` }} 
                    />
                  </div>
                </div>

                {/* Gauge 2: Wind Speed */}
                <div id="sensor-wind" className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-sky-50 dark:bg-sky-950/30 text-sky-500 rounded-lg mb-2">
                    <Wind size={16} />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                    WIND VELOCITY
                  </span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">
                    {selectedStation.windSpeed} km/h
                  </span>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((selectedStation.windSpeed / 40) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                {/* Gauge 3: Pressure */}
                <div id="sensor-pressure" className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-lg mb-2 animate-[pulse_3s_infinite]">
                    <Compass size={16} />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                    BAROMETER
                  </span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">
                    {selectedStation.pressure} hPa
                  </span>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${((selectedStation.pressure - 950) / 100) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Trend Line Chart */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-sans">
                    Temperature Trend Index
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded border border-indigo-100/50 dark:border-indigo-900/40">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      7-DAY METRIC
                    </span>
                  </div>
                </div>

                <div className="w-full h-44 relative -ml-4 pr-1">
                  {selectedStation.history && selectedStation.history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStation.history} margin={{ top: 12, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/60 dark:text-slate-800/60" />
                        <XAxis 
                          dataKey="label" 
                          stroke="#94a3b8" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          dy={6}
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
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                          }}
                          labelFormatter={(label) => `${label} Condition`}
                          formatter={(value: any) => [`${value}°C`, "Temperature"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="#6366f1" 
                          strokeWidth={2.5}
                          dot={{ r: 4, stroke: "#6366f1", strokeWidth: 1.5, fill: "#ffffff" }}
                          activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "#4f46e5" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400 font-sans">
                      No matching meteorological trend coordinates.
                    </div>
                  )}
                </div>
              </div>

              {/* Explanatory telemetry metrics description */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] text-slate-500 leading-relaxed font-sans mt-3">
                <strong>Meteorological Calibration Info:</strong> Interactive changes made via the slider or location triggers alter these active trend line coordinates. Keep parameters stable to ensure balanced animations.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="bg-slate-50/80 dark:bg-slate-950/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-sans">
        <span className="flex items-center gap-1.5 font-medium">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
            (isSnowActive || isBalloonActive) ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
          }`} />
          <span>Simulation {(isSnowActive || isBalloonActive) ? "Running" : "Standby"}</span>
        </span>

        {(isSnowActive || isBalloonActive) && (
          <button
            id="btn-clear-simulations"
            onClick={onClearAll}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-500 hover:dark:text-rose-400 transition-colors font-semibold cursor-pointer py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
          >
            <Trash2 size={12} />
            <span>Clear FX Stage</span>
          </button>
        )}
      </div>
    </div>
  );
}
