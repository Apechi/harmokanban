"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "arknights" | "endfield";

interface CustomizationContextProps {
  theme: Theme;
  accentColor: string; // Hex code or empty string for default
  bgOpacity: number; // Percentage: 0 to 100
  showGrid: boolean;
  showScanlines: boolean;
  bgImage: string; // URL or preset identifier
  soundEnabled: boolean;
  setTheme: (t: Theme) => void;
  setAccentColor: (color: string) => void;
  setBgOpacity: (opacity: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowScanlines: (show: boolean) => void;
  setBgImage: (url: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const CustomizationContext = createContext<CustomizationContextProps | undefined>(undefined);

export const presetAccentColors = {
  arknights: [
    { name: "Tactical Purple", value: "#a855f7" },
    { name: "Rhodes Red", value: "#f43f5e" },
    { name: "Originium Orange", value: "#f97316" },
    { name: "Liskarm Blue", value: "#3b82f6" },
    { name: "Lancre Teal", value: "#0d9488" },
  ],
  endfield: [
    { name: "Endfield Gold", value: "#F8F546" },
    { name: "Tactical Olive", value: "#657136" },
    { name: "Rust Red", value: "#b91c1c" },
    { name: "Graphite Slate", value: "#7E807C" },
    { name: "Steel Teal", value: "#507573" },
  ]
};

export const presetBgImages = [
  { name: "Grid Tech Texture", value: "/bg.webp" },
  { name: "Empty Space", value: "none" }
];

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("arknights");
  const [accentColor, setAccentColorState] = useState<string>("");
  const [bgOpacity, setBgOpacityState] = useState<number>(4);
  const [showGrid, setShowGridState] = useState<boolean>(true);
  const [showScanlines, setShowScanlinesState] = useState<boolean>(true);
  const [bgImage, setBgImageState] = useState<string>("/bg.webp");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("kh-theme");
      if (storedTheme === "endfield" || storedTheme === "arknights") {
        setThemeState(storedTheme as Theme);
      }
      
      const storedAccent = localStorage.getItem("kh-accent-color");
      if (storedAccent) {
        setAccentColorState(storedAccent);
      }
      
      const storedOpacity = localStorage.getItem("kh-bg-opacity");
      if (storedOpacity !== null) {
        setBgOpacityState(parseInt(storedOpacity, 10));
      }
      
      const storedGrid = localStorage.getItem("kh-show-grid");
      if (storedGrid !== null) {
        setShowGridState(storedGrid === "true");
      }
      
      const storedScanlines = localStorage.getItem("kh-show-scanlines");
      if (storedScanlines !== null) {
        setShowScanlinesState(storedScanlines === "true");
      }
      
      const storedBgImage = localStorage.getItem("kh-bg-image");
      if (storedBgImage !== null) {
        setBgImageState(storedBgImage);
      }

      const storedSound = localStorage.getItem("kh-sound-enabled");
      if (storedSound !== null) {
        setSoundEnabledState(storedSound === "true");
      }
    } catch (e) {
      console.error("Failed to load customization preferences", e);
    }
    setMounted(true);
  }, []);

  // Sync state to local storage and DOM
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("kh-theme", theme);
      
      const root = document.documentElement;
      if (theme === "endfield") {
        root.classList.add("theme-endfield");
      } else {
        root.classList.remove("theme-endfield");
      }
    } catch (e) {}
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("kh-accent-color", accentColor);
      const root = document.documentElement;
      if (accentColor) {
        root.style.setProperty("--brand-accent", accentColor);
      } else {
        root.style.removeProperty("--brand-accent");
      }
    } catch (e) {}
  }, [accentColor, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kh-bg-opacity", bgOpacity.toString());
  }, [bgOpacity, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kh-show-grid", showGrid.toString());
  }, [showGrid, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kh-show-scanlines", showScanlines.toString());
  }, [showScanlines, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kh-bg-image", bgImage);
  }, [bgImage, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("kh-sound-enabled", soundEnabled.toString());
  }, [soundEnabled, mounted]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    // If setting to theme default accent color, clear custom accent
    setAccentColorState("");
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  const setBgOpacity = (opacity: number) => {
    setBgOpacityState(Math.max(0, Math.min(100, opacity)));
  };

  const setShowGrid = (show: boolean) => {
    setShowGridState(show);
  };

  const setShowScanlines = (show: boolean) => {
    setShowScanlinesState(show);
  };

  const setBgImage = (url: string) => {
    setBgImageState(url);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  const resetToDefaults = () => {
    setThemeState("arknights");
    setAccentColorState("");
    setBgOpacityState(4);
    setShowGridState(true);
    setShowScanlinesState(true);
    setBgImageState("/bg.webp");
    setSoundEnabledState(true);
  };

  return (
    <CustomizationContext.Provider
      value={{
        theme,
        accentColor,
        bgOpacity,
        showGrid,
        showScanlines,
        bgImage,
        soundEnabled,
        setTheme,
        setAccentColor,
        setBgOpacity,
        setShowGrid,
        setShowScanlines,
        setBgImage,
        setSoundEnabled,
        resetToDefaults,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error("useCustomization must be used within a CustomizationProvider");
  }
  return context;
};
