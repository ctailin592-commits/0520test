/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, VolumeX, List, Hash, RefreshCw, Scroll, ShieldCheck } from 'lucide-react';

import { DrawMode, DrawHistoryItem } from './types';
import { luckyAudio } from './utils/audio';
import { fortunesData } from './data/fortunes';

// Subcomponents
import ListDrawPanel from './components/ListDrawPanel';
import NumberDrawPanel from './components/NumberDrawPanel';
import StickDrawPanel from './components/StickDrawPanel';
import DrawHistory from './components/DrawHistory';

export default function App() {
  const [activeMode, setActiveMode] = useState<DrawMode>('list');
  const [history, setHistory] = useState<DrawHistoryItem[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isDrawingGlobal, setIsDrawingGlobal] = useState<boolean>(false);

  // Load persistent histories and sounds from localstorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('draw_history_list');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.warn('Load history failed:', e);
      }
    }
    
    const savedSound = localStorage.getItem('draw_sound_preference');
    if (savedSound !== null) {
      const isSoundEnabled = savedSound === 'true';
      setSoundOn(isSoundEnabled);
      luckyAudio.toggleSound(isSoundEnabled);
    }
  }, []);

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    luckyAudio.toggleSound(nextVal);
    localStorage.setItem('draw_sound_preference', String(nextVal));
    luckyAudio.playTick();
  };

  const handleDrawComplete = (results: string[]) => {
    const label = activeMode === 'list' 
      ? '名單抽籤' 
      : activeMode === 'number' 
        ? '隨機選號' 
        : '傳統求籤';

    const timestamp = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    
    // Add multiple winners in drawing results as single items
    const newItems: DrawHistoryItem[] = results.map((res, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      mode: activeMode,
      modeLabel: label,
      result: res,
      timestamp,
    }));

    const updated = [...newItems, ...history].slice(0, 150); // limit to last 150 items
    setHistory(updated);
    localStorage.setItem('draw_history_list', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm('您確定要清空所有的抽籤記錄嗎？這項動作無法還原。')) {
      setHistory([]);
      localStorage.removeItem('draw_history_list');
      luckyAudio.playTick();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-slate-800 flex flex-col antialiased">
      
      {/* Decorative border at very top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      {/* Main navigation header */}
      <header className="py-4 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand/logo block */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-100">
              <Sparkles className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                幸運之輪 ‧ 抽籤御手
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium scale-90">
                  v2.0
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 block tracking-wide">
                名單篩選 · 智慧選號 · 傳統求籤筒二合一工具
              </span>
            </div>
          </div>

          {/* Sound settings speaker overlay toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${soundOn ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

        </div>
      </header>

      {/* Main interactive application body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col justify-start">
        
        {/* Core structure grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch w-full">
          
          {/* Main draw workspace - 9 columns */}
          <div className="xl:col-span-9 flex flex-col space-y-5">
            
            {/* Horizontal Capsule Mode Switch Tab bar */}
            <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm flex items-center gap-1.5 w-full md:w-fit relative">
              <button
                disabled={isDrawingGlobal}
                onClick={() => { setActiveMode('list'); luckyAudio.playTick(); }}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${activeMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <List className="w-4 h-4" />
                名單抽籤模式
              </button>
              <button
                disabled={isDrawingGlobal}
                onClick={() => { setActiveMode('number'); luckyAudio.playTick(); }}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${activeMode === 'number' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Hash className="w-4 h-4" />
                隨機選號模式
              </button>
              <button
                disabled={isDrawingGlobal}
                onClick={() => { setActiveMode('stick'); luckyAudio.playTick(); }}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${activeMode === 'stick' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Scroll className="w-4 h-4" />
                傳統籤筒模式
              </button>
            </div>

            {/* Layout representation switches */}
            <div className="flex-1 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeMode === 'list' && (
                    <ListDrawPanel 
                      onDrawComplete={handleDrawComplete} 
                      isDrawingGlobal={isDrawingGlobal} 
                      setIsDrawingGlobal={setIsDrawingGlobal}
                    />
                  )}
                  {activeMode === 'number' && (
                    <NumberDrawPanel 
                      onDrawComplete={handleDrawComplete} 
                      isDrawingGlobal={isDrawingGlobal} 
                      setIsDrawingGlobal={setIsDrawingGlobal}
                    />
                  )}
                  {activeMode === 'stick' && (
                    <StickDrawPanel 
                      onDrawComplete={handleDrawComplete} 
                      isDrawingGlobal={isDrawingGlobal} 
                      setIsDrawingGlobal={setIsDrawingGlobal}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Right audit log - 3 columns */}
          <div className="xl:col-span-3">
            <DrawHistory history={history} onClearHistory={handleClearHistory} />
          </div>

        </div>

      </main>

      {/* Footer footer */}
      <footer className="py-5 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 text-[11px] font-sans">
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            100% 網頁安全防護 · 所有抽籤均在瀏覽器客戶端生成，絕無後台操控。
          </div>
          <div>
            © 2026 幸運之輪抽籤系統 ‧ 誠心誠意製作 🍂
          </div>
        </div>
      </footer>

    </div>
  );
}
