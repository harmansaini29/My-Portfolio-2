'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface StickySectionProps {
  children: React.ReactNode;
  negativeMarginTop?: boolean;
  opacityMap?: number[];
  scaleMap?: number[];
  opacityStops?: number[];
  scaleStops?: number[];
  height?: string;
  startEndOffset?: ["start end" | "start start", "end start" | "end end"];
}

export default function StickySection({ 
  children, 
  negativeMarginTop = false,
  opacityMap = [0, 1, 1, 0],
  scaleMap = [0.8, 1, 1, 0.8],
  opacityStops = [0, 0.33, 0.66, 1],
  scaleStops = [0, 0.33, 0.66, 1],
  height = '150vh',
  startEndOffset = ['start end', 'end start']
}: StickySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: startEndOffset
  });

  const opacity = useTransform(scrollYProgress, opacityStops, opacityMap);
  const scale = useTransform(scrollYProgress, scaleStops, scaleMap);

  return (
    <div ref={containerRef} style={{ height, position: 'relative', marginTop: negativeMarginTop ? '-100vh' : '0' }}>
      <motion.div style={{ position: 'sticky', top: 0, height: '100vh', opacity, scale, overflow: 'hidden' }}>
        {children}
      </motion.div>
    </div>
  );
}
