/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, Copy, Check, Share2, ClipboardList } from 'lucide-react';
import { DrawHistoryItem } from '../types';

interface DrawHistoryProps {
  history: DrawHistoryItem[];
  onClearHistory: () => void;
}

export default function DrawHistory({ history, onClearHistory }: DrawHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySingle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    if (history.length === 0) return;
    const compiled = history.map(h => `[${h.timestamp}] (${h.modeLabel}) ${h.result}`).join('\n');
    navigator.clipboard.writeText(compiled);
    alert('已複製全部抽籤記錄到剪貼簿！');
  };

  return (
    <div id="draw-history" className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm h-full flex flex-col justify-between">
      
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-500" />
            抽籤歷史存摺
          </h3>
          {history.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyAll}
                className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                複製全部
              </button>
              <button
                onClick={onClearHistory}
                className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-500 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                清空
              </button>
            </div>
          )}
        </div>

        {/* Draw history items logs list container */}
        <div className="overflow-y-auto max-h-[360px] pr-1 space-y-2.5">
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-300 flex flex-col items-center justify-center space-y-2">
                <ClipboardList className="w-8 h-8 stroke-1 text-slate-300" />
                <span className="text-xs">尚無任何抽籤結果記錄</span>
                <span className="text-[10px] text-slate-400">當您按下開始抽籤，結果將記錄在此。</span>
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="p-3 bg-slate-50 border border-slate-100/90 rounded-2xl flex items-start gap-2 justify-between group hover:bg-slate-100/60 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md scale-90">
                        {item.modeLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    {/* Value representation */}
                    <p className="text-xs font-semibold text-slate-700 font-sans leading-relaxed text-wrap">
                      {item.result}
                    </p>
                  </div>

                  {/* Copy helper */}
                  <button
                    onClick={() => handleCopySingle(item.id, item.result)}
                    className="text-slate-400 hover:text-emerald-500 p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats indicators at bottom */}
      <div className="pt-4 border-t border-slate-50 mt-4">
        <div className="grid grid-cols-2 gap-3 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block">累計抽取總數</span>
            <strong className="text-sm text-slate-700 font-mono font-bold">
              {history.length} 次
            </strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block">當前最佳幸運</span>
            <strong className="text-sm text-emerald-600 font-bold">小幸運 🌟</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
