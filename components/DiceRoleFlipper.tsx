'use client';

import React, { useState, useEffect, useRef } from 'react';
import './DiceRoleFlipper.css';

interface DiceRoleFlipperProps {
  roles?: string[];
  intervalMs?: number;
  className?: string;
}

const ROLE_ICONS: Record<string, string> = {
  'Full Stack Developer': '⚡',
  'Java Systems Engineer': '☕',
  '3D WebGL Architect': '⚛️',
  'Algorithmic Trader': '📈',
  'Horology Analyst': '⏱️',
};

const DEFAULT_ICON = '✦';

export default function DiceRoleFlipper({
  roles = [
    'Full Stack Developer',
    'Java Systems Engineer',
    '3D WebGL Architect',
    'Algorithmic Trader',
    'Horology Analyst',
  ],
  intervalMs = 3000,
  className = '',
}: DiceRoleFlipperProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutIdsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  useEffect(() => {
    if (!roles || roles.length === 0) return;

    const interval = setInterval(() => {
      setPhase('exit');

      addTimeout(() => {
        setIndex((prev) => (prev + 1) % roles.length);
        setPhase('enter');

        addTimeout(() => {
          setPhase('idle');
        }, 340);
      }, 340);
    }, intervalMs);

    return () => {
      clearInterval(interval);
      clearAllTimeouts();
    };
  }, [roles, intervalMs]);

  const currentRole = roles[index] ?? '';
  const nextRole = roles[(index + 1) % roles.length] ?? '';
  const currentIcon = ROLE_ICONS[currentRole] ?? DEFAULT_ICON;
  const nextIcon = ROLE_ICONS[nextRole] ?? DEFAULT_ICON;

  return (
    <div className={`dice-flipper-container ${className}`}>
      <div className="dice-flipper-neon-glow" aria-hidden />

      <div className={`dice-flipper-box${phase !== 'idle' ? ' glowing' : ''}`}>
        <span className="dice-bracket dice-bracket-tl" aria-hidden />
        <span className="dice-bracket dice-bracket-br" aria-hidden />

        <div className={`dice-flipper-cube flipping-${phase}`}>
          <div className="dice-face dice-face-front">
            <span className="dice-role-icon">{currentIcon}</span>
            <span className="dice-role-text">{currentRole}</span>
          </div>
          <div className="dice-face dice-face-bottom">
            <span className="dice-role-icon">{nextIcon}</span>
            <span className="dice-role-text">{nextRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
}