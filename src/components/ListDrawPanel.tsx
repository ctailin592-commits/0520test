/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Sparkles, RefreshCw, Layers, Users, Eye, HelpCircle } from 'lucide-react';
import { luckyAudio } from '../utils/audio';

interface ListDrawPanelProps {
  onDrawComplete: (winners: string[]) => void;
  isDrawingGlobal: boolean;
  setIsDrawingGlobal: (isDrawing: boolean) => void;
}

const PRESETS = [
  {
    name: '🏢 尾牙摸彩名單',
    items: ['林俊逸', '張雅琪', '陳大維', '許家豪', '王莉婷', '吳志強', '黃千惠', '楊振宇', '劉伊婷', '蔡明峰', '曾子豪', '賴郁安', '周美華', '朱敏賢', '沈建和'],
  },
  {
    name: '🧹 誰做家事/值日生',
    items: ['誰去洗碗', '誰倒垃圾', '誰買飲料', '誰拖地板', '誰擦桌子', '誰去繳費', '免做家事（大吉）'],
  },
  {
    name: '🍕 隨機午餐決定器',
    items: ['牛肉麵', '拉麵', '美式漢堡', '迴轉壽司', '日式定食', '健康低卡餐包', '義大利麵', '麻辣火鍋', '港式飲茶', '泰式料理'],
  }
];

export default function ListDrawPanel({ onDrawComplete, isDrawingGlobal, setIsDrawingGlobal }: ListDrawPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [excludeDrawn, setExcludeDrawn] = useState<boolean>(true);
  
  // Animation/Draw internal states
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [animWinners, setAnimWinners] = useState<string[]>([]);
  const [isShowingWinnerModal, setIsShowingWinnerModal] = useState<boolean>(false);

  // Load first preset by default
  useEffect(() => {
    loadPreset(0);
  }, []);

  const loadPreset = (index: number) => {
    const preset = PRESETS[index];
    setItems(preset.items);
    setInputValue(preset.items.join('\n'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const parsed = e.target.value
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    setItems(parsed);
  };

  // Immediate single item add
  const [singleItem, setSingleItem] = useState('');
  const handleAddSingleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleItem.trim()) return;
    const updated = [...items, singleItem.trim()];
    setItems(updated);
    setInputValue(updated.join('\n'));
    setSingleItem('');
    luckyAudio.playTick();
  };

  const handleClearAll = () => {
    setItems([]);
    setInputValue('');
  };

  const handleResetToPreset = () => {
    loadPreset(0);
  };

  const startDraw = () => {
    if (items.length === 0) {
      luckyAudio.playError();
      alert('請先輸入或載入抽籤名單！');
      return;
    }
    if (items.length < drawCount) {
      luckyAudio.playError();
      alert(`候選名單共有 ${items.length} 項，不足以抽出 ${drawCount} 項！`);
      return;
    }

    setIsDrawingGlobal(true);
    setAnimWinners([]);
    
    // Choose the actual winners ahead of time (unbiased)
    const pool = [...items];
    const winners: string[] = [];
    
    for (let i = 0; i < drawCount; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool[idx]);
      if (excludeDrawn) {
        pool.splice(idx, 1);
      }
    }

    // High fidelity slot-machine shuffle animation
    let tickCount = 0;
    let speed = 40; // milliseconds between shuffles
    const maxTicks = 45; // total cycles before settling

    const performShuffle = () => {
      // Pick a random index pure for aesthetics highlight
      const aestheticIdx = Math.floor(Math.random() * items.length);
      setCurrentIndex(aestheticIdx);
      luckyAudio.playTick();
      tickCount++;

      if (tickCount < maxTicks) {
        // Natural exponential deceleration feel
        if (tickCount > 30) {
          speed += 25;
        } else if (tickCount > 38) {
          speed += 55;
        }
        setTimeout(performShuffle, speed);
      } else {
        // Settle animation completed
        setCurrentIndex(-1);
        setIsDrawingGlobal(false);
        setAnimWinners(winners);
        setIsShowingWinnerModal(true);
        luckyAudio.playWin();

        // If exclude drawn option is true, update the candidates pool
        if (excludeDrawn) {
          const remaining = items.filter(val => !winners.includes(val));
          setItems(remaining);
          setInputValue(remaining.join('\n'));
        }

        // Parent callback for history logs
        onDrawComplete(winners);
      }
    };

    performShuffle();
  };

  return (
    <div id="list-draw-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
      
      {/* Configuration column (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              名單設定
            </h3>
            <span className="text-xs font-mono bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1">
              剩餘個數: <strong>{items.length}</strong>
            </span>
          </div>

          {/* Quick presets list */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">常用快速範本：</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(idx)}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick item insertion */}
          <form onSubmit={handleAddSingleItem} className="flex gap-2">
            <input
              type="text"
              placeholder="新增單一候選項..."
              value={singleItem}
              onChange={(e) => setSingleItem(e.target.value)}
              disabled={isDrawingGlobal}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-200 outline-none rounded-xl transition-all"
            />
            <button
              type="submit"
              disabled={isDrawingGlobal}
              className="px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:opacity-50 transition-colors rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Large text area */}
          <div className="relative">
            <textarea
              className="w-full h-44 text-sm font-sans p-3 bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-200 outline-none rounded-2xl resize-none transition-colors"
              placeholder="請輸入抽籤名單，一行代表一個候選項..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={isDrawingGlobal}
            />
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 flex-col gap-1.5 text-xs">
                <Users className="w-6 h-6 stroke-1 text-slate-300" />
                <span>請在此處輸入名單</span>
              </div>
            )}
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
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
              <label className="text-xs text-slate-400 block">重複中獎選項</label>
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

        {/* Clear buttons at bottom */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-4">
          <button
            onClick={handleClearAll}
            disabled={isDrawingGlobal || items.length === 0}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-2 border border-slate-100 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空所有
          </button>
          <button
            onClick={handleResetToPreset}
            disabled={isDrawingGlobal}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置預設
          </button>
        </div>
      </div>

      {/* Visual draw layout area (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100 relative overflow-hidden min-h-[460px]">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-100/20 rounded-full blur-2xl pointer-events-none" />

        {/* Status display */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            抽籤大廳
          </span>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            預覽名單候選物卡
          </div>
        </div>

        {/* Dynamic content center board */}
        <div className="my-auto py-8 relative z-10 flex flex-col items-center justify-center h-full">
          {items.length === 0 ? (
            <div className="text-center max-w-xs space-y-2">
              <HelpCircle className="w-12 h-12 text-slate-300 stroke-1 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">候選名單空空如也</p>
              <p className="text-xs text-slate-400">請在左側的名單設定中輸入任何想抽的人名或獎項，或直接點選常用範本試試看！</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-6">
              {/* Spinning/shuffling name element */}
              <div className="w-80 h-32 bg-white rounded-2xl border border-slate-100/80 shadow-sm flex items-center justify-center text-center relative overflow-hidden px-4">
                <AnimatePresence mode="popLayout">
                  {isDrawingGlobal ? (
                    <motion.div
                      key={currentIndex}
                      initial={{ y: 25, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -25, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.05 }}
                      className="text-2xl font-bold text-slate-800 tracking-wide filter blur-[0.3px]"
                    >
                      {items[currentIndex] || '🔍'}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="static"
                      className="flex flex-col items-center justify-center space-y-1"
                    >
                      <Layers className="w-7 h-7 text-emerald-500/80 animate-bounce mb-1" />
                      <p className="text-sm text-slate-400">準備就緒，點擊下方「開始抽籤」</p>
                      <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        共 {items.length} 個選項
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Items bubble cloud view */}
              <div className="w-full p-4 bg-white/40 border border-white/60 backdrop-blur-sm rounded-2xl max-h-36 overflow-y-auto">
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {items.map((item, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border font-sans select-none transition-all ${
                        isDrawingGlobal && currentIndex === idx
                          ? 'bg-emerald-500 text-white border-emerald-600 scale-110 shadow-md font-semibold'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Big Draw button */}
        <div className="relative z-10 w-full mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={startDraw}
            disabled={isDrawingGlobal || items.length === 0}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base rounded-2xl shadow-md disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 animate-spin-slow" />
            {isDrawingGlobal ? '瘋狂攪拌抽籤中...' : `立即抽出 ${drawCount} 位幸運兒！`}
          </button>
        </div>

      </div>

      {/* Modal dialog showcasing draw result with standard high consistency */}
      <AnimatePresence>
        {isShowingWinnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-slate-50 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="text-xs text-slate-400 tracking-wider uppercase font-mono mb-1">抽籤幸運抽中結果</p>
              <h4 className="text-xl font-bold text-slate-800 mb-5">恭喜中獎！🎉</h4>

              {/* Award Board */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 space-y-2">
                {animWinners.map((winner, index) => (
                  <div key={index} className="flex items-center justify-center gap-2 py-1.5 border-b border-dashed border-slate-150 last:border-0">
                    <span className="text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-lg font-bold text-slate-800">{winner}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsShowingWinnerModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                收下這份幸運 (關閉)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
