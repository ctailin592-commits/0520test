/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Eye, Scroll } from 'lucide-react';
import { luckyAudio } from '../utils/audio';
import { fortunesData } from '../data/fortunes';
import { FortuneStick } from '../types';

interface StickDrawPanelProps {
  onDrawComplete: (stickDetails: string[]) => void;
  isDrawingGlobal: boolean;
  setIsDrawingGlobal: (isDrawing: boolean) => void;
}

export default function StickDrawPanel({ onDrawComplete, isDrawingGlobal, setIsDrawingGlobal }: StickDrawPanelProps) {
  const [shaking, setShaking] = useState<boolean>(false);
  const [stickRising, setStickRising] = useState<boolean>(false);
  const [drawnStick, setDrawnStick] = useState<FortuneStick | null>(null);
  const [isShowingScroll, setIsShowingScroll] = useState<boolean>(false);

  // Trigger shake and stick draw
  const startStickDraw = () => {
    if (isDrawingGlobal) return;

    setIsDrawingGlobal(true);
    setShaking(true);
    setStickRising(false);
    setDrawnStick(null);

    // Play multiple quick shake sound rattling
    let rattleCount = 0;
    const rattleInterval = setInterval(() => {
      luckyAudio.playShake();
      rattleCount++;
      if (rattleCount >= 10) {
        clearInterval(rattleInterval);
      }
    }, 120);

    // Stop shaking after 1.5s
    setTimeout(() => {
      setShaking(false);
      setStickRising(true);
      luckyAudio.playTick();

      // Rise stick and show fortune
      setTimeout(() => {
        // Draw random entry from fortunes library safely
        const randomIdx = Math.floor(Math.random() * fortunesData.length);
        const stick = fortunesData[randomIdx];
        
        setDrawnStick(stick);
        setIsShowingScroll(true);
        luckyAudio.playWin();
        setIsDrawingGlobal(false);

        // Record history log
        onDrawComplete([`籤詩：${stick.name} (${stick.fortune}) - ${stick.meaning}`]);
      }, 800);

    }, 1500);
  };

  const closeScrollAndReset = () => {
    setIsShowingScroll(false);
    setStickRising(false);
    setDrawnStick(null);
  };

  // Get color configurations based on fortune strength
  const getFortuneBadgeColor = (type: string) => {
    switch (type) {
      case '大吉': return 'bg-rose-50 border-rose-100 text-rose-600';
      case '上吉': return 'bg-amber-50 border-amber-100 text-amber-600';
      case '中吉': return 'bg-orange-50 border-orange-100 text-orange-600';
      case '吉': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case '小吉': return 'bg-teal-50 border-teal-100 text-teal-600';
      default: return 'bg-slate-50 border-slate-100 text-slate-600';
    }
  };

  return (
    <div id="stick-draw-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
      
      {/* Information guidelines bar (4 columns) */}
      <div className="lg:col-span-4 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <Scroll className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-slate-700">互動籤筒說明</span>
          </div>

          <div className="space-y-3.5 text-xs text-slate-500 font-sans leading-relaxed">
            <p>
              這是基於東方傳統<strong>求籤祈福</strong>設計的互動籤筒。您可以誠心默想您的問題（如：今日運勢、決策建議...）。
            </p>
            <p className="bg-slate-50 p-3 rounded-2xl border border-dotted border-slate-150 text-slate-600">
              「心誠則靈，一問一籤。」
            </p>
            <div className="space-y-1.5">
              <span className="font-semibold block text-slate-700">籤運分佈參考：</span>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400">
                <li><strong className="text-rose-500">大吉/上吉</strong>：運勢如日東升，此時不搏更待何時</li>
                <li><strong className="text-orange-500">中吉/吉</strong>：事態平和發展，可迎風順行</li>
                <li><strong className="text-slate-500">平/中平</strong>：宜沉潛修養，心存善良不急切</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Vintage note card */}
        <div className="border-t border-slate-50 pt-4 mt-6">
          <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-amber-600/90 font-mono">
              🏯 百年廟宇文學籤典
            </span>
          </div>
        </div>
      </div>

      {/* Interactive visual canvas - right side (8 columns) */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-900 text-slate-100 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden min-h-[460px]">
        {/* Mystic starry sky glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header indicator */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs bg-zinc-800 text-emerald-400 border border-zinc-700 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            意念合一
          </span>
          <span className="text-xs text-zinc-500 font-sans flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            點擊籤筒或按鈕即可搖晃
          </span>
        </div>

        {/* Shaking cylinder container area */}
        <div className="my-auto py-6 relative z-10 flex flex-col items-center justify-center h-full min-h-[220px]">
          <div className="relative cursor-pointer select-none" onClick={startStickDraw}>
            
            {/* Bamboo Stick rising element */}
            <AnimatePresence>
              {stickRising && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: -130, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-36 w-3.5 h-36 bg-amber-100 border border-amber-300 rounded-md shadow-lg flex flex-col justify-between py-2 items-center z-0"
                >
                  {/* Mystic stamp tip */}
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[9px] text-slate-700 writing-vertical select-none leading-none font-bold">
                    吉
                  </span>
                  <div className="w-1.5 h-2 bg-slate-200 rounded" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cylinder SVG body */}
            <motion.div
              animate={shaking ? {
                x: [0, -8, 8, -6, 6, -4, 4, 0],
                rotate: [0, -4, 4, -3, 3, -2, 2, 0],
              } : {}}
              transition={{
                duration: 1.2,
                repeat: shaking ? Infinity : 0,
                ease: 'easeInOut'
              }}
              className="relative z-10 filter drop-shadow-2xl"
            >
              <svg className="w-40 h-44" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Traditional Chinese wooden draw bucket container */}
                {/* Bamboo texture background */}
                <ellipse cx="80" cy="50" rx="36" ry="12" fill="#5F4229" stroke="#3D2919" strokeWidth="2" />
                
                {/* Outer sticks standing inside */}
                <path d="M72 25 L68 50" stroke="#E6C280" strokeWidth="3" strokeLinecap="round" />
                <path d="M79 20 L76 50" stroke="#DCA250" strokeWidth="3" strokeLinecap="round" />
                <path d="M88 23 L85 52" stroke="#E6C280" strokeWidth="3" strokeLinecap="round" />
                <path d="M60 30 L64 54" stroke="#DCA250" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M96 28 L90 53" stroke="#F6D290" strokeWidth="3" strokeLinecap="round" />
                <path d="M83 23 L80 50" stroke="#DCA250" strokeWidth="3.5" strokeLinecap="round" />

                {/* Cylinder main block body */}
                <path d="M44 50 C44 50 44 165 44 175 C44 185 60 190 80 190 C100 190 116 185 116 175 C116 165 116 50 116 50" fill="url(#brass-grad)" stroke="#3D2919" strokeWidth="3" />
                
                {/* Cylinder collar ring borders */}
                <ellipse cx="80" cy="50" rx="36" ry="10" fill="#7C5D3F" stroke="#3D2919" strokeWidth="2.5" />
                <ellipse cx="80" cy="175" rx="36" ry="10" fill="#4B331F" stroke="#3D2919" strokeWidth="2.5" />

                {/* Ancient gold badge logo plaque on center cylinder */}
                <ellipse cx="80" cy="115" rx="18" ry="18" fill="url(#badge-grad)" stroke="#E5C158" strokeWidth="1.5" />
                <text x="80" y="121" fill="#FDE047" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">籤</text>

                {/* Gradients */}
                <defs>
                  <linearGradient id="brass-grad" x1="44" y1="120" x2="116" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#8A6242" />
                    <stop offset="50%" stopColor="#A17551" />
                    <stop offset="100%" stopColor="#6E4C30" />
                  </linearGradient>
                  <linearGradient id="badge-grad" x1="62" y1="115" x2="98" y2="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#B31E1E" />
                    <stop offset="100%" stopColor="#800D0D" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
          
          <span className="text-xs text-zinc-400 font-sans mt-3">
            {shaking ? '⏳ 屏氣凝神，神木籤板劇烈搖晃中...' : (stickRising ? '💡 正在挑出一枝專屬靈籤...' : '誠心敲擊上方籤筒，問卜前程')}
          </span>
        </div>

        {/* Start shake trigger button */}
        <div className="relative z-10 w-full mt-auto pt-4 border-t border-zinc-800">
          <button
            onClick={startStickDraw}
            disabled={isDrawingGlobal}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-semibold text-base rounded-2xl shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scroll className="w-5 h-5" />
            {isDrawingGlobal ? '求籤進行中...' : '開始靈感搖晃求籤'}
          </button>
        </div>

      </div>

      {/* Traditional wood-toned poetic scroll overlay drawer modal */}
      <AnimatePresence>
        {isShowingScroll && drawnStick && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="bg-[#FDFBF7] text-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 border-[#8B3A3A]/40 flex flex-col items-center relative"
            >
              {/* Wooden scroll visual header decorative bar */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-[#8B3A3A] rounded-t-[14px]" />
              
              {/* Scroll handles styling */}
              <div className="absolute -top-1.5 -left-2 w-4 h-6 bg-[#D4AF37] rounded-md shadow-sm" />
              <div className="absolute -top-1.5 -right-2 w-4 h-6 bg-[#D4AF37] rounded-md shadow-sm" />

              <div className="text-center w-full mt-3 space-y-4">
                <span className="text-xs font-mono tracking-widest text-[#8B3A3A] font-bold block">
                  🏯 幸運籤堂 · 靈能詩籤
                </span>
                
                {/* Stick name */}
                <h4 className="text-2xl font-bold text-slate-800 border-b border-rose-100 pb-2">
                  {drawnStick.name}
                </h4>

                {/* Fortune Strength Huge block */}
                <div className="inline-block px-5 py-2.5 rounded-full border border-[#8B3A3A]/20 bg-[#FDF1F1] text-2xl font-black text-[#8B3A3A] tracking-wider font-sans shadow-inner">
                  {drawnStick.fortune}
                </div>

                {/* Poem section with high-contrast text */}
                <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-[#DCA251]/20 my-4 text-center space-y-2">
                  <span className="text-[11px] text-[#DCA251] font-mono tracking-widest block font-bold uppercase">
                    ── 【 籤詩古文 】 ──
                  </span>
                  <p className="text-xl font-semibold text-[#8B3A3A] leading-relaxed tracking-wider font-sans antialiased">
                    {drawnStick.content}
                  </p>
                </div>

                {/* Meaning Explanation paragraph */}
                <div className="text-left space-y-2 max-h-48 overflow-y-auto pr-1">
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                    📜 今日吉凶白話釋義：
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed bg-[#FAF6EE]/50 p-3 rounded-xl border border-slate-100 font-sans">
                    {drawnStick.meaning}
                  </p>
                  
                  {/* Category Details tags */}
                  <div className="text-xs font-semibold text-rose-700/90 py-1.5 px-2 bg-rose-50/50 rounded-xl leading-relaxed text-center font-mono select-none">
                    {drawnStick.category}
                  </div>
                </div>

                {/* Reset or Draw alternative stick */}
                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-6 w-full">
                  <button
                    onClick={() => {
                      closeScrollAndReset();
                      startStickDraw();
                    }}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    重求一籤
                  </button>
                  <button
                    onClick={closeScrollAndReset}
                    className="flex-1 py-2.5 bg-[#8B3A3A] hover:bg-[#733030] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    謝天領旨 (關閉)
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
