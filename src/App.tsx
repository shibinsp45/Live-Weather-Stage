import { useState, useEffect } from "react";
import ControlPanel from "./components/ControlPanel";
import SnowflakeEffect from "./components/SnowflakeEffect";
import BalloonEffect from "./components/BalloonEffect";
import { Sparkles, Sun, CloudSnow, Flame, Command } from "lucide-react";
import { WEATHER_STATIONS } from "./data";
import { WeatherStation } from "./types";

export default function App() {
  const [stations, setStations] = useState<WeatherStation[]>(WEATHER_STATIONS);
  const [selectedStation, setSelectedStation] = useState<WeatherStation>(WEATHER_STATIONS[0]);

  const [snowTriggerId, setSnowTriggerId] = useState<number>(0);
  const [balloonTriggerId, setBalloonTriggerId] = useState<number>(0);

  const [snowTimeRemaining, setSnowTimeRemaining] = useState<number>(0);
  const [balloonTimeRemaining, setBalloonTimeRemaining] = useState<number>(0);

  // Search states
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Default theme settings
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Monitor system dark mode cleanly
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);
  }, []);

  // Snowflake simulation timer
  useEffect(() => {
    if (snowTimeRemaining <= 0) return;
    const timer = setTimeout(() => {
      setSnowTimeRemaining((prev) => {
        const nextVal = prev - 0.1;
        return nextVal < 0.05 ? 0 : nextVal;
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [snowTimeRemaining]);

  // Balloon simulation timer
  useEffect(() => {
    if (balloonTimeRemaining <= 0) return;
    const timer = setTimeout(() => {
      setBalloonTimeRemaining((prev) => {
        const nextVal = prev - 0.1;
        return nextVal < 0.05 ? 0 : nextVal;
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [balloonTimeRemaining]);

  // Primary trigger functions
  const handleTriggerSnowflakes = () => {
    setSnowTriggerId(Date.now());
    setSnowTimeRemaining(5.0);
  };

  const handleTriggerBalloons = () => {
    setBalloonTriggerId(Date.now());
    setBalloonTimeRemaining(5.0);
  };

  // Reset stage controls
  const handleClearAll = () => {
    setSnowTriggerId(0);
    setBalloonTriggerId(0);
    setSnowTimeRemaining(0);
    setBalloonTimeRemaining(0);
  };

  // Interactive station selection
  const handleSelectStation = (station: WeatherStation) => {
    setSelectedStation(station);
    
    // Auto trigger related visual weather effects
    if (station.condition === "Snowy") {
      setSnowTriggerId(Date.now());
      setSnowTimeRemaining(5.0);
    } else if (station.condition === "Festive") {
      setBalloonTriggerId(Date.now());
      setBalloonTimeRemaining(5.0);
    } else {
      // Clear current effects to signify moderate weather
      handleClearAll();
    }
  };

  // Temperature slide handler (crosses thresholds to trigger live weather alerts!)
  const handleTemperatureChange = (newTemp: number) => {
    const tempDelta = newTemp - selectedStation.temperature;
    const originalHistory = selectedStation.history || [
      { label: "Mon", temp: selectedStation.temperature - 3 },
      { label: "Tue", temp: selectedStation.temperature - 2 },
      { label: "Wed", temp: selectedStation.temperature + 1 },
      { label: "Thu", temp: selectedStation.temperature - 1 },
      { label: "Fri", temp: selectedStation.temperature + 2 },
      { label: "Sat", temp: selectedStation.temperature - 1 },
      { label: "Sun", temp: selectedStation.temperature }
    ];

    const updatedHistory = originalHistory.map((item, index) => {
      // Modify last point exactly to newTemp, other points shift by 40% of delta
      if (index === originalHistory.length - 1) {
        return { ...item, temp: newTemp };
      }
      return { ...item, temp: item.temp + Math.round(tempDelta * 0.4) };
    });

    const updatedStation: WeatherStation = { 
      ...selectedStation, 
      temperature: newTemp,
      history: updatedHistory
    };

    setSelectedStation(updatedStation);

    // Update preset database copy so everything updates live in search tabs
    setStations((prev) =>
      prev.map((s) => (s.id === selectedStation.id ? { ...s, temperature: newTemp, history: updatedHistory } : s))
    );

    // Trigger feedback immediately when crossing limits
    if (newTemp <= 0 && snowTimeRemaining <= 0) {
      handleTriggerSnowflakes();
    } else if (newTemp >= 15 && balloonTimeRemaining <= 0) {
      handleTriggerBalloons();
    }
  };

  // REST API request query dispatcher
  const handleSearchCity = async (cityName: string) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch("/api/weather/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName }),
      });
      
      if (!response.ok) {
        throw new Error("Meteorological service offline. Verify local proxy.");
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Map received backend payload payload structure
      const searchedStation: WeatherStation = {
        id: data.cityName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        cityName: data.cityName,
        country: data.country,
        temperature: Number(data.temperature),
        humidity: Number(data.humidity),
        windSpeed: Number(data.windSpeed),
        pressure: Number(data.pressure),
        badgeText: `${data.badgeText} (${data.source})`,
        condition: data.condition,
        history: data.history || [
          { label: "Mon", temp: Number(data.temperature) - 3 },
          { label: "Tue", temp: Number(data.temperature) - 1 },
          { label: "Wed", temp: Number(data.temperature) + 2 },
          { label: "Thu", temp: Number(data.temperature) },
          { label: "Fri", temp: Number(data.temperature) - 2 },
          { label: "Sat", temp: Number(data.temperature) + 1 },
          { label: "Sun", temp: Number(data.temperature) },
        ]
      };

      // Upsert stations state list - always prefix results
      setStations((prev) => {
        const foundIndex = prev.findIndex(
          (s) => s.cityName.toLowerCase() === data.cityName.toLowerCase()
        );
        if (foundIndex >= 0) {
          const cleanList = [...prev];
          cleanList[foundIndex] = searchedStation;
          return cleanList;
        }
        return [searchedStation, ...prev];
      });

      setSelectedStation(searchedStation);

      // Trigger respective interactive particles
      if (searchedStation.temperature <= 0 || searchedStation.condition === "Snowy") {
        setSnowTriggerId(Date.now());
        setSnowTimeRemaining(5.0);
      } else if (searchedStation.temperature >= 15 || searchedStation.condition === "Festive") {
        setBalloonTriggerId(Date.now());
        setBalloonTimeRemaining(5.0);
      } else {
        handleClearAll();
      }
    } catch (err: any) {
      console.error("[MetDesk] Search request error: ", err);
      setSearchError(err.message || "Failed to retrieve local weather.");
    } finally {
      setIsSearching(false);
    }
  };

  // Dynamically compute beautiful meteorology background elements based on temperature or condition
  const getAmbientStyles = () => {
    const temp = selectedStation.temperature;
    if (temp <= 0) {
      // Frozen/Arctic Sky
      return isDarkMode
        ? "bg-slate-950 text-slate-100 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] shadow-[inset_0_0_120px_rgba(56,189,248,0.08)]"
        : "bg-sky-50/70 text-slate-950 bg-[radial-gradient(#bae6fd_1.5px,transparent_1.5px)] [background-size:24px_24px] shadow-[inset_0_0_120px_rgba(14,165,233,0.06)]";
    } else if (temp >= 15) {
      // Floating/Fiesta Sky
      return isDarkMode
        ? "bg-slate-950 text-slate-100 bg-[radial-gradient(#271c2b_1.5px,transparent_1.5px)] [background-size:24px_24px] shadow-[inset_0_0_120px_rgba(244,63,94,0.07)]"
        : "bg-rose-50/40 text-slate-950 bg-[radial-gradient(#fed7aa_1.5px,transparent_1.5px)] [background-size:24px_24px] shadow-[inset_0_0_120px_rgba(244,63,94,0.05)]";
    } else {
      // Moderate/Clear Sky
      return isDarkMode
        ? "bg-slate-950 text-slate-100 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        : "bg-slate-50 text-slate-900 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px]";
    }
  };

  return (
    <div
      id="main-viewport-container"
      className={`min-h-screen w-full relative flex flex-col items-center justify-between p-6 overflow-hidden md:p-12 transition-all duration-700 ${getAmbientStyles()}`}
    >
      {/* Decorative Brand Header (Formal & Minimal) */}
      <header id="stage-banner-header" className="w-full max-w-7xl mx-auto flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/80 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-800">
            <Command size={14} className="text-indigo-500 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <span className="font-display font-medium tracking-wider text-[10px] text-slate-400 dark:text-slate-500 uppercase block">
              Weather Playground
            </span>
            <span className="text-[9px] font-mono font-medium text-indigo-500 dark:text-indigo-400">
              Interactive Sandbox Stage
            </span>
          </div>
        </div>
        
        {/* Sky Condition Status HUD */}
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-slate-200/40 dark:border-slate-850">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
            {selectedStation.temperature <= 0 ? (
              <>
                <CloudSnow size={11} className="text-sky-400" />
                <span>Arctic Freeze</span>
              </>
            ) : selectedStation.temperature >= 15 ? (
              <>
                <Flame size={11} className="text-rose-400" />
                <span>Thermal Draft</span>
              </>
            ) : (
              <>
                <Sun size={11} className="text-amber-500" />
                <span>Temperate Climate</span>
              </>
            )}
          </span>
        </div>
      </header>

      {/* Main Core View Area with Control Dashboard */}
      <main id="stage-main-canvas" className="w-full flex-grow flex items-center justify-center py-10">
        <ControlPanel
          onTriggerSnowflakes={handleTriggerSnowflakes}
          onTriggerBalloons={handleTriggerBalloons}
          onClearAll={handleClearAll}
          snowTimeRemaining={snowTimeRemaining}
          balloonTimeRemaining={balloonTimeRemaining}
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
          onTemperatureChange={handleTemperatureChange}
          stations={stations}
          onSearchCity={handleSearchCity}
          isSearching={isSearching}
          searchError={searchError}
          onClearSearchError={() => setSearchError(null)}
        />
      </main>

      {/* Dynamic Overlay Particle Screens */}
      {snowTriggerId > 0 && (
        <SnowflakeEffect
          key={`snow-${snowTriggerId}`}
          triggerId={snowTriggerId}
          onComplete={() => {
            // Cascade run completed
          }}
        />
      )}

      {balloonTriggerId > 0 && (
        <BalloonEffect
          key={`balloon-${balloonTriggerId}`}
          triggerId={balloonTriggerId}
          onComplete={() => {
            // Balloons flight completed
          }}
        />
      )}

      {/* Footer Meta Details */}
      <footer id="stage-page-footer" className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 border-t border-slate-200/30 dark:border-slate-800/20 pt-4">
        <p className="text-[9px] font-mono tracking-wider text-slate-400 dark:text-slate-600 uppercase">
          © {new Date().getFullYear()} Weather Stage • Interactive Sandbox
        </p>
        <p className="text-[9px] font-mono tracking-wider text-slate-400 dark:text-slate-600 uppercase">
          Current Station: <span className="text-indigo-400 font-bold">{selectedStation.cityName}</span>
        </p>
      </footer>
    </div>
  );
}
