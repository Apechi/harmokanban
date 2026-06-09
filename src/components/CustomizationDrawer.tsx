"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Paintbrush, Sliders, Image as ImageIcon, RotateCcw, Monitor } from "lucide-react";
import { useCustomization, presetAccentColors, presetBgImages } from "./CustomizationContext";

interface CustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomizationDrawer({ isOpen, onClose }: CustomizationDrawerProps) {
  const {
    theme,
    accentColor,
    bgOpacity,
    showGrid,
    showScanlines,
    bgImage,
    setTheme,
    setAccentColor,
    setBgOpacity,
    setShowGrid,
    setShowScanlines,
    setBgImage,
    resetToDefaults,
  } = useCustomization();

  const [customUrl, setCustomUrl] = useState(
    presetBgImages.some(img => img.value === bgImage) ? "" : bgImage
  );

  // Sync local input state with context value
  useEffect(() => {
    if (presetBgImages.some(img => img.value === bgImage)) {
      setCustomUrl("");
    } else {
      setCustomUrl(bgImage);
    }
  }, [bgImage]);

  const activePresets = theme === "endfield" ? presetAccentColors.endfield : presetAccentColors.arknights;
  const currentDefaultAccent = theme === "endfield" ? "#657136" : "#a855f7";

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomUrl(url);
    if (url.trim()) {
      setBgImage(url.trim());
    } else {
      setBgImage("/bg.webp");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs cursor-pointer"
          />

          {/* Sliding Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-brand-card/95 border-l border-brand-accent/30 z-50 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md font-mono text-slate-100 overflow-y-auto"
          >
            {/* Upper Section */}
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-brand-accent/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5 text-brand-accent animate-pulse" />
                  <h2 className="text-sm font-bold tracking-widest uppercase">
                    VIBE CONFIGURATOR
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-brand-accent transition-colors rounded-sm border border-transparent hover:border-brand-accent/20 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Theme Settings */}
              <div className="border border-brand-accent/15 bg-brand-bg/30 p-4 rounded-xs mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Monitor size={12} className="text-brand-accent" />
                  <span>VISUAL THEME MODE</span>
                </div>
                
                <div className="flex bg-brand-bg/60 p-0.5 border border-brand-accent/20 rounded-xs">
                  <button
                    type="button"
                    onClick={() => setTheme("arknights")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      theme === "arknights"
                        ? "bg-brand-accent text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ARKNIGHTS (DARK)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("endfield")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      theme === "endfield"
                        ? "bg-brand-accent text-white"
                        : "text-slate-450 hover:text-slate-200"
                    }`}
                  >
                    ENDFIELD (LIGHT)
                  </button>
                </div>
              </div>

              {/* Accent Color Customization */}
              <div className="border border-brand-accent/15 bg-brand-bg/30 p-4 rounded-xs mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Paintbrush size={12} className="text-brand-accent" />
                  <span>ACCENT COLOR HIGHLIGHTS</span>
                </div>

                {/* Preset Circles */}
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {/* Default Reset/Theme Color */}
                  <button
                    onClick={() => setAccentColor("")}
                    title="Default Theme Accent"
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                      accentColor === "" ? "border-white scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: currentDefaultAccent }}
                  >
                    {accentColor === "" && <Check size={14} className="text-white drop-shadow-md z-10" />}
                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
                  </button>

                  {activePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setAccentColor(preset.value)}
                      title={preset.name}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer relative ${
                        accentColor === preset.value ? "border-white scale-110" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.value }}
                    >
                      {accentColor === preset.value && (
                        <Check size={14} className="text-white drop-shadow-md z-10" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Picker */}
                <div className="flex items-center gap-3 bg-brand-bg/40 p-2.5 border border-brand-accent/10 rounded-xs">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider flex-1 cursor-pointer">
                    CUSTOM CHROMATIC SELECTOR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor || currentDefaultAccent}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-xs border border-brand-accent/30 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor || "DEFAULT"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith("#") && val.length <= 7) {
                          setAccentColor(val);
                        } else if (val === "" || val.toLowerCase() === "default") {
                          setAccentColor("");
                        }
                      }}
                      className="w-24 bg-brand-bg text-slate-200 text-[10px] px-2 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent text-center font-bold tracking-wider"
                    />
                  </div>
                </div>
              </div>

              {/* Background & Overlays Configurator */}
              <div className="border border-brand-accent/15 bg-brand-bg/30 p-4 rounded-xs mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sliders size={12} className="text-brand-accent" />
                  <span>BACKGROUND OVERLAY CONSOLE</span>
                </div>

                <div className="space-y-4">
                  {/* Grid Lines Toggle */}
                  <div className="flex items-center justify-between bg-brand-bg/30 px-3 py-2 border border-brand-accent/10 rounded-xs">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      TACTICAL GRID LINES
                    </span>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`px-3 py-1 rounded-xs text-[10px] font-bold border uppercase transition-all cursor-pointer ${
                        showGrid
                          ? "bg-brand-accent/25 border-brand-accent text-brand-accent"
                          : "bg-slate-800/40 border-slate-700 text-slate-500"
                      }`}
                    >
                      {showGrid ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  {/* Scanlines Toggle */}
                  <div className="flex items-center justify-between bg-brand-bg/30 px-3 py-2 border border-brand-accent/10 rounded-xs">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      CRT SCANLINES EFFECT
                    </span>
                    <button
                      onClick={() => setShowScanlines(!showScanlines)}
                      className={`px-3 py-1 rounded-xs text-[10px] font-bold border uppercase transition-all cursor-pointer ${
                        showScanlines
                          ? "bg-brand-accent/25 border-brand-accent text-brand-accent"
                          : "bg-slate-800/40 border-slate-700 text-slate-500"
                      }`}
                    >
                      {showScanlines ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  {/* Background Opacity Slider */}
                  <div className="bg-brand-bg/30 p-3 border border-brand-accent/10 rounded-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        OVERLAY OPACITY / INTENSITY
                      </span>
                      <span className="text-xs font-bold text-brand-accent">
                        {bgOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-brand-accent cursor-pointer bg-brand-bg/60 h-1 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Background Custom Picture Presets */}
                  <div className="bg-brand-bg/30 p-3 border border-brand-accent/10 rounded-xs space-y-3">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-brand-accent" />
                      <span>BACKGROUND TEXTURE MATTE</span>
                    </div>

                    <div className="flex gap-2">
                      {presetBgImages.map((img) => (
                        <button
                          key={img.value}
                          onClick={() => {
                            setBgImage(img.value);
                            setCustomUrl("");
                          }}
                          className={`flex-1 py-1.5 border text-[10px] font-bold uppercase rounded-xs transition-all cursor-pointer ${
                            bgImage === img.value
                              ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
                              : "bg-brand-bg/60 border-brand-accent/10 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {img.name}
                        </button>
                      ))}
                    </div>

                    {/* Custom Image URL Input */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider block">
                        CUSTOM BACKGROUND IMAGE URL
                      </label>
                      <input
                        type="text"
                        value={customUrl}
                        onChange={handleCustomUrlChange}
                        placeholder="https://example.com/image.png"
                        className="w-full bg-brand-bg text-slate-200 text-xs px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent placeholder-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset / Footer Actions */}
            <div className="mt-8 border-t border-brand-accent/20 pt-4 flex flex-col gap-3">
              <button
                onClick={resetToDefaults}
                className="w-full py-2 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-slate-100 font-bold uppercase tracking-wider text-xs rounded-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                RESET CONFIG TO DEFAULT
              </button>
              
              <div className="text-[9px] text-slate-500 leading-normal text-center">
                VIBE LAYERS PERSISTED CLIENT-SIDE VIA LOCAL STORAGE.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
