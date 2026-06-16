import { useState, useEffect } from "react";
import ControlPanel from "./components/ControlPanel";
import SnowflakeEffect from "./components/SnowflakeEffect";
import BalloonEffect from "./components/BalloonEffect";
import { Sparkles, Sun, Moon, CloudSnow, Flame, Command } from "lucide-react";
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

  // Monitor system dark mode cleanly on boot
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);
  }, []);

  // Sync dark mode state with root document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
        ? "bg-slate-950 text-slate-100 bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950/80"
        : "bg-sky-50 text-slate-900 bg-gradient-to-tr from-sky-100/90 via-sky-50 to-indigo-100/80";
    } else if (temp >= 15) {
      // Floating/Fiesta Sky
      return isDarkMode
        ? "bg-slate-950 text-slate-100 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-955/20"
        : "bg-rose-50/80 text-slate-900 bg-gradient-to-tr from-rose-100/70 via-orange-50/80 to-amber-105/50";
    } else {
      // Moderate/Clear Sky
      return isDarkMode
        ? "bg-slate-950 text-slate-100 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/60"
        : "bg-slate-50 text-slate-900 bg-gradient-to-tr from-slate-100 via-teal-50 to-indigo-50/60";
    }
  };

  // Compute colors for the dynamic glassmorphism backdrop background blobs
  const getBlobClasses = () => {
    const temp = selectedStation.temperature;
    if (temp <= 0) {
      return {
        one: "bg-cyan-500/25 dark:bg-cyan-500/10",
        two: "bg-blue-600/20 dark:bg-blue-600/15",
        three: "bg-indigo-400/25 dark:bg-indigo-400/10",
      };
    } else if (temp >= 15) {
      return {
        one: "bg-orange-400/25 dark:bg-orange-500/10",
        two: "bg-rose-500/25 dark:bg-rose-500/15",
        three: "bg-yellow-400/20 dark:bg-yellow-405/10",
      };
    } else {
      return {
        one: "bg-teal-400/20 dark:bg-teal-400/10",
        two: "bg-sky-400/25 dark:bg-sky-500/15",
        three: "bg-indigo-300/20 dark:bg-indigo-900/10",
      };
    }
  };

  const blobColors = getBlobClasses();

  return (
    <div
      id="main-viewport-container"
      className={`min-h-screen w-full relative flex flex-col items-center justify-between p-6 overflow-hidden md:p-12 transition-all duration-1000 ${getAmbientStyles()}`}
    >
      {/* Dynamic Animated Glassmorphism Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className={`absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-60 mix-blend-multiply dark:mix-blend-screen transition-all duration-1000 ${blobColors.one}`} 
        />
        <div 
          className={`absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-65 mix-blend-multiply dark:mix-blend-screen transition-all duration-1000 ${blobColors.two}`} 
        />
        <div 
          className={`absolute top-1/4 left-1/3 w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-40 mix-blend-overlay transition-all duration-1000 ${blobColors.three}`} 
        />
      </div>

      {/* Decorative Brand Header (Glassmorphic) */}
      <header id="stage-banner-header" className="w-full max-w-7xl mx-auto flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-white/20 dark:bg-slate-900/30 backdrop-blur-md rounded-xl text-slate-800 dark:text-slate-100 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/40 dark:border-white/10">
            <Command size={15} className="text-indigo-500 dark:text-indigo-400 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <span className="font-display font-medium tracking-wider text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
              Weather Playground
            </span>
            <span className="text-[9px] font-mono font-medium text-indigo-600 dark:text-indigo-400 block mt-0.5">
              Interactive Sandbox Stage
            </span>
          </div>
        </div>
        
        {/* Sky Condition & Theme Toggler Glass HUD */}
        <div className="flex items-center gap-3">
          {/* Quick interactive Theme Mode Toggle Button */}
          <button
            id="theme-toggler"
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-2 bg-white/20 dark:bg-slate-900/30 backdrop-blur-md rounded-full border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 hover:scale-105 transition-all shadow-sm cursor-pointer"
            title="Switch Atmosphere Theme"
          >
            {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
          </button>

          <div className="flex items-center gap-2 bg-white/20 dark:bg-slate-900/30 backdrop-blur-md py-1.5 px-3.5 rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-700 dark:text-slate-300 font-bold uppercase flex items-center gap-1.5">
              {selectedStation.temperature <= 0 ? (
                <>
                  <CloudSnow size={11} className="text-sky-500 dark:text-sky-400" />
                  <span>Arctic Freeze</span>
                </>
              ) : selectedStation.temperature >= 15 ? (
                <>
                  <Flame size={11} className="text-rose-500 dark:text-rose-400" />
                  <span>Thermal Draft</span>
                </>
              ) : (
                <>
                  <Sun size={11} className="text-amber-500 dark:text-amber-400" />
                  <span>Temperate Climate</span>
                </>
              )}
            </span>
          </div>
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
