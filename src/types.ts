/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DrawMode = 'list' | 'number' | 'stick';

export interface DrawHistoryItem {
  id: string;
  mode: DrawMode;
  modeLabel: string;
  result: string;
  timestamp: string;
}

export interface FortuneStick {
  id: number;
  name: string; // Stick name, e.g., "第 1 籤"
  fortune: '大吉' | '上吉' | '中吉' | '吉' | '平' | '小吉' | '中平';
  content: string; // The poetic phase
  meaning: string; // The plain reading translation
  category: string; // Advice categories like 事業, 感情, 財運
}
