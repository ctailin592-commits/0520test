/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'star';
  angle: number;
  delay: number;
  duration: number;
  rotate: number;
}

const COLORS = [
  '#FBBF24', // Yellow Gold
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4'  // Cyan
];

const SHAPES: ('circle' | 'square' | 'triangle' | 'star')[] = ['circle', 'square', 'triangle', 'star'];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      // Explode from center screen outwards
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 220;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 80; // slightly upward bias

      list.push({
        id: i,
        x,
        y,
        size: 6 + Math.random() * 12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        angle: Math.random() * 360,
        delay: Math.random() * 0.1,
        duration: 1.5 + Math.random() * 1.5,
        rotate: 360 + Math.random() * 720
      });
    }
    setParticles(list);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => {
        let path = '';
        if (p.shape === 'triangle') {
          path = 'M50,0 L100,100 L0,100 Z';
        } else if (p.shape === 'star') {
          path = 'M50,0 L61,35 L97,35 L68,57 L79,91 L50,70 L21,91 L32,57 L3,35 L39,35 Z';
        }

        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, rotation: 0, opacity: 1 }}
            animate={{
              x: p.x,
              y: p.y + 200, // drift down as gravity pulls
              scale: [0, 1, 1, 0.8, 0],
              rotate: p.rotate,
              opacity: [1, 1, 1, 0.6, 0]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.1, 0.8, 0.25, 1] // swift release, slow float
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '40%',
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
          >
            {p.shape === 'circle' && (
              <div
                className="rounded-full shadow-sm"
                style={{ width: p.size, height: p.size, backgroundColor: p.color }}
              />
            )}
            {p.shape === 'square' && (
              <div
                className="shadow-sm"
                style={{ width: p.size, height: p.size, backgroundColor: p.color, borderRadius: '2px' }}
              />
            )}
            {(p.shape === 'triangle' || p.shape === 'star') && (
              <svg
                viewBox="0 0 100 100"
                style={{ width: p.size, height: p.size }}
                fill={p.color}
                className="drop-shadow-sm"
              >
                <path d={path} />
              </svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
