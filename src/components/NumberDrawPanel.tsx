/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Binary, Sparkles, Hash, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { luckyAudio } from '../utils/audio';

interface NumberDrawPanelProps {
  onDrawComplete: (numbers: string[]) => void;
  isDrawingGlobal: boolean;
  setIsDrawingGlobal: (isDrawing: boolean) => void;
}

const RANGE_PRESETS = [
  { name: '🎲 兩位數 (1 - 10)', min: 1, max: 10 },
  { name: '💯 百分百 (1 - 100)', min: 1, max: 100 },
  { name: '🎟️ 尾牙票卡 (101 - 200)', min: 101, max: 200 },
  { name: '📆 月份日期 (1 - 31)', min: 1, max: 31 }
];

export default function NumberDrawPanel({ onDrawComplete, isDrawingGlobal, setIsDrawingGlobal }: NumberDrawPanelProps) {
  const [minVal, setMinVal] = useState<number>(1);
  const [maxVal, setMaxVal] = useState<number>(100);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [excludeDrawn, setExcludeDrawn] = useState<boolean>(true);
  
  // Keep track of what numbers are remaining when exclusion is enabled
  const [remainingPool, setRemainingPool] = useState<number[]>([]);
  
  // Internal animation state
  const [activeShuffleNum, setActiveShuffleNum] = useState<number>(-1);
  const [animWinners, setAnimWinners] = useState<number[]>([]);
  const [isShowingWinnerModal, setIsShowingWinnerModal] = useState<boolean>(false);

  // Re-generate pool when min or max changes
  useEffect(() => {
    resetPool();
  }, [minVal, maxVal]);

  const resetPool = () => {
    if (minVal > maxVal) return;
    const pool: number[] = [];
    for (let i = minVal; i <= maxVal; i++) {
      pool.push(i);
    }
    setRemainingPool(pool);
  };

  const loadRangePreset = (min: number, max: number) => {
    setMinVal(min);
    setMaxVal(max);
    luckyAudio.playTick();
  };

  const startDraw = () => {
    if (minVal > maxVal) {
      luckyAudio.playError();
      alert('最小值不可大於最大值！');
      return;
    }
    
    const pool = excludeDrawn ? [...remainingPool] : Array.from({ length: maxVal - minVal + 1 }, (_, i) => minVal + i);

    if (pool.length === 0) {
      luckyAudio.playError();
      alert('可選數字池已空！請重設範置或允許重複數字。');
      return;
    }

    if (pool.length < drawCount) {
      luckyAudio.playError();
      alert(`剩餘可用數數字共有 ${pool.length} 個，不足以抽出 ${drawCount} 個！`);
      return;
    }

    setIsDrawingGlobal(true);
    setAnimWinners([]);

    // Pre-calculate winning numbers
    const winners: number[] = [];
    const selectionPool = [...pool];

    for (let i = 0; i < drawCount; i++) {
      const idx = Math.floor(Math.random() * selectionPool.length);
      winners.push(selectionPool[idx]);
      selectionPool.splice(idx, 1);
    }

    let tickCount = 0;
    let speed = 40;
    const maxTicks = 40;

    const performShuffle = () => {
      // Pick random number from pool for visual flash
      const visualIdx = Math.floor(Math.random() * pool.length);
      setActiveShuffleNum(pool[visualIdx]);
      luckyAudio.playTick();
      tickCount++;

      if (tickCount < maxTicks) {
        if (tickCount > 28) {
          speed += 30;
        } else if (tickCount > 35) {
          speed += 60;
        }
        setTimeout(performShuffle, speed);
      } else {
        // Settle
        setActiveShuffleNum(-1);
        setIsDrawingGlobal(false);
        setAnimWinners(winners);
        setIsShowingWinnerModal(true);
        luckyAudio.playWin();

        if (excludeDrawn) {
          const updated = remainingPool.filter(val => !winners.includes(val));
          setRemainingPool(updated);
        }

        onDrawComplete(winners.map(num => `號碼：${num}`));
      }
    };

    performShuffle();
  };

  return (
    <div id="number-draw-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
      
      {/* Settings layout - left side (5 col) */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-emerald-500" />
              選號設定
            </h3>
            <span className="text-xs font-mono bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1">
              可抽數: <strong>{excludeDrawn ? remainingPool.length : (maxVal - minVal + 1)}</strong>
            </span>
          </div>

          {/* Quick presets list */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">常用數值區間：</span>
            <div className="flex flex-wrap gap-1.5">
              {RANGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadRangePreset(p.min, p.max)}
                  className="text-xs px-2.5  py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer text-left"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Range input card */}
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
            <span className="text-xs text-slate-500 font-semibold block">設定數字界限</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">最小值 (Min)</label>
                <input
                  type="number"
                  value={minVal}
                  onChange={(e) => setMinVal(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isDrawingGlobal}
                  className="w-full text-sm font-semibold px-3 py-2 bg-white border border-slate-100 focus:border-emerald-200 outline-none rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">最大值 (Max)</label>
                <input
                  type="number"
                  value={maxVal}
                  onChange={(e) => setMaxVal(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isDrawingGlobal}
                  className="w-full text-sm font-semibold px-3 py-2 bg-white border border-slate-100 focus:border-emerald-200 outline-none rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Options select */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">一次抽出個數</label>
              <select
                value={drawCount}
                onChange={(e) => setDrawCount(Number(e.target.value))}
                disabled={isDrawingGlobal}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none cursor-pointer"
              >
                {[1, 2, 3, 5, 10].map(c => (
                  <option key={c} value={c}>{c} 個</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">重複抽取數字</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 p-1.5 rounded-xl h-9">
                <button
                  type="button"
                  onClick={() => setExcludeDrawn(true)}
                  disabled={isDrawingGlobal}
                  className={`flex-1 text-[10px] font-semibold py-1 rounded-lg transition-all ${excludeDrawn ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  排除
                </button>
                <button
                  type="button"
                  onClick={() => setExcludeDrawn(false)}
                  disabled={isDrawingGlobal}
                  className={`flex-1 text-[10px] font-semibold py-1 rounded-lg transition-all ${!excludeDrawn ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  重複
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clear/Reset button */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-6">
          <button
            onClick={resetPool}
            disabled={isDrawingGlobal || !excludeDrawn}
            className="w-full flex items-center justify-center gap-1 text-xs py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置數字池
          </button>
        </div>
      </div>

      {/* Visual draw display - right side (7 col) */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100 relative overflow-hidden min-h-[460px]">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-100/20 rounded-full blur-2xl pointer-events-none" />

        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            數字滾筒
          </span>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            顯示目前可用數字
          </div>
        </div>

        {/* Visual rolling display */}
        <div className="my-auto py-8 relative z-10 flex flex-col items-center justify-center h-full">
          {minVal > maxVal ? (
            <div className="text-center max-w-xs space-y-1">
              <span className="text-rose-500 text-sm font-semibold">區間設定錯誤</span>
              <p className="text-xs text-slate-400">起點數值不可低於終點數值，請修正數值。</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-6">
              
              {/* Massive active wheel */}
              <div className="w-80 h-32 bg-white rounded-2xl border border-slate-100/80 shadow-sm flex items-center justify-center text-center relative overflow-hidden px-4">
                <AnimatePresence mode="popLayout">
                  {isDrawingGlobal ? (
                    <motion.div
                      key={activeShuffleNum}
                      initial={{ y: 25, opacity: 0, scale: 0.85 }}
                      animate={{ y: 0, opacity: 1, scale: 1.1 }}
                      exit={{ y: -25, opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.05 }}
                      className="text-4xl font-extrabold text-teal-600 font-mono"
                    >
                      {activeShuffleNum !== -1 ? activeShuffleNum : '🎲'}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="static"
                      className="flex flex-col items-center justify-center space-y-1"
                    >
                      <Binary className="w-7 h-7 text-emerald-500/80 animate-bounce mb-1" />
                      <p className="text-sm text-slate-400">就緒！數值區間為 {minVal} 至 {maxVal}</p>
                      <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        剩餘 {excludeDrawn ? remainingPool.length : (maxVal - minVal + 1)} 個數字球
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Number bubbles layout */}
              <div className="w-full p-4 bg-white/40 border border-white/60 backdrop-blur-sm rounded-2xl overflow-y-auto max-h-36">
                <div className="flex flex-wrap gap-2 justify-center">
                  {excludeDrawn ? (
                    remainingPool.slice(0, 100).map((num) => (
                      <span
                        key={num}
                        className={`w-8 h-8 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition-all ${
                          isDrawingGlobal && activeShuffleNum === num
                            ? 'bg-emerald-500 text-white border-emerald-600 scale-110 shadow-md'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                        }`}
                      >
                        {num}
                      </span>
                    ))
                  ) : (
                    Array.from({ length: Math.min(100, maxVal - minVal + 1) }, (_, i) => minVal + i).map((num) => (
                      <span
                        key={num}
                        className={`w-8 h-8 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition-all ${
                          isDrawingGlobal && activeShuffleNum === num
                            ? 'bg-emerald-500 text-white border-emerald-600 scale-110 shadow-md'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                        }`}
                      >
                        {num}
                      </span>
                    ))
                  )}
                  {/* Truncate message if pool is huge */}
                  {excludeDrawn && remainingPool.length > 100 && (
                    <span className="text-xs text-slate-400 self-center font-mono ml-2">
                      ... 其餘 {remainingPool.length - 100} 個數字
                    </span>
                  )}
                  {!excludeDrawn && (maxVal - minVal + 1) > 100 && (
                    <span className="text-xs text-slate-400 self-center font-mono ml-2">
                      ... 其餘 {(maxVal - minVal + 1) - 100} 個數字
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Start button */}
        <div className="relative z-10 w-full mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={startDraw}
            disabled={isDrawingGlobal}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base rounded-2xl shadow-md disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 animate-spin-slow" />
            {isDrawingGlobal ? '瘋狂旋轉選號中...' : `立即隨機抽出 ${drawCount} 個號碼！`}
          </button>
        </div>

      </div>

      {/* Modal dialog showcasing draw result */}
      <AnimatePresence>
        {isShowingWinnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-slate-50 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Hash className="w-7 h-7" />
              </div>
              <p className="text-xs text-slate-400 tracking-wider uppercase font-mono mb-1">幸運之神降臨中獎碼</p>
              <h4 className="text-xl font-bold text-slate-800 mb-5">選號結果揭曉！🎉</h4>

              {/* Award Numbers display */}
              <div className="flex flex-wrap gap-3.5 justify-center py-2 px-1 w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                {animWinners.map((val, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.6, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: idx * 0.08, type: 'spring' }}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 font-mono text-xl font-bold text-white flex items-center justify-center shadow-md border-2 border-white"
                  >
                    {val}
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setIsShowingWinnerModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                收下中獎數字 (關閉)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
