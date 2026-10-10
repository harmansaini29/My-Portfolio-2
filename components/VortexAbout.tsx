// components/VortexAbout.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";

import GooeyTextReveal from "@/components/ui/GooeyTextReveal";
import "./VortexAbout.css";

const Vortex = dynamic(() => import("./Vortex"), { ssr: false });

// Exact GLSL Sobel Edge Detection & FBM Noise Dissolve Shaders
const coverVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coverFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uDissolve;
  uniform vec2 uCenter;
  uniform float uTime;
  uniform float uGrayscale;
  uniform float uEdgeIntensity;
  uniform float uEdgeBrightness;
  varying vec2 vUv;

  mat3 sobelX = mat3(
    -1.0, 0.0, 1.0,
    -2.0, 0.0, 2.0,
    -1.0, 0.0, 1.0
  );

  mat3 sobelY = mat3(
    -1.0, -2.0, -1.0,
     0.0,  0.0,  0.0,
     1.0,  2.0,  1.0
  );

  float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  float sobel(sampler2D tex, vec2 uv, vec2 texelSize) {
    float gx = 0.0;
    float gy = 0.0;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 offset = vec2(float(i), float(j)) * texelSize;
        float lum = getLuminance(texture2D(tex, uv + offset).rgb);
        gx += lum * sobelX[i + 1][j + 1];
        gy += lum * sobelY[i + 1][j + 1];
      }
    }
    return sqrt(gx * gx + gy * gy);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec4 texColor = texture2D(uTexture, uv);
    
    float gray = getLuminance(texColor.rgb);
    vec3 grayscaleColor = vec3(gray);
    texColor.rgb = mix(texColor.rgb, grayscaleColor, uGrayscale);
    
    vec2 centeredUv = vUv - uCenter;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    centeredUv.x *= aspect;
    float dist = length(centeredUv);
    
    float angle = atan(centeredUv.y, centeredUv.x);
    
    float noiseScale = 6.0;
    vec2 pixelatedUv = floor(vUv * uResolution / noiseScale) * noiseScale / uResolution;
    float blockNoise = fbm(pixelatedUv * 100.0) * 0.15;
    float angularNoise = fbm(vec2(angle * 5.0, 0.0)) * 0.15;
    
    float totalNoise = blockNoise + angularNoise;
    float noisyDist = dist + totalNoise;
    
    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float normalizedDist = noisyDist / maxDist;
    
    float dissolveThreshold = uDissolve * 1.5; 
    
    vec2 texelSize = 1.0 / uResolution;
    float edge = sobel(uTexture, uv, texelSize);
    
    edge = pow(edge, 0.7) * 2.0;
    edge = clamp(edge, 0.0, 1.0);
    
    float dissolveMask = smoothstep(dissolveThreshold - 0.03, dissolveThreshold, normalizedDist);
    
    vec3 edgeColor = vec3(1.0, 1.0, 1.0);
    vec3 baseColor = mix(texColor.rgb, vec3(0.0), uGrayscale);
    vec3 finalColor = baseColor;
    
    float edgeGlowIntensity = uEdgeIntensity * 2.0;
    float edgeGlow = edge * edgeGlowIntensity * (1.0 + uGrayscale * 3.0);
    finalColor += edgeColor * edgeGlow * uEdgeBrightness;
    
    float edgeZoneWidth = 0.15 * (1.0 - uDissolve) + 0.02;
    float edgeZone = smoothstep(dissolveThreshold - edgeZoneWidth, dissolveThreshold - edgeZoneWidth + 0.04, normalizedDist) * 
                     smoothstep(dissolveThreshold + 0.02, dissolveThreshold - 0.02, normalizedDist);
    float sparkle = hash(floor(vUv * uResolution / 4.0)) * edgeZone;
    
    float edgeBrightness = (1.0 - uDissolve) * uEdgeBrightness * (1.0 + uGrayscale * 2.0);
    finalColor += vec3(sparkle * 3.0 * edgeBrightness);
    
    float alpha = dissolveMask * texColor.a;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Procedural Dynamic 3D WebGL Vortex Canvas Texture (Fallback)
 */
function createProceduralVortexTexture(): { texture: THREE.CanvasTexture; update: (t: number) => void } {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const update = (time: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;

    const strandCount = 120;
    for (let i = 0; i < strandCount; i++) {
      const angleOffset = (i / strandCount) * Math.PI * 2 + time * 0.35;
      ctx.beginPath();
      for (let r = 20; r < size * 0.65; r += 8) {
        const spiralAngle = angleOffset + (r / size) * 8.5;
        const x = cx + Math.cos(spiralAngle) * r;
        const y = cy + Math.sin(spiralAngle) * r;
        if (r === 20) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = i % 4 === 0 ? "rgba(6, 182, 212, 0.7)" : i % 4 === 1 ? "rgba(249, 115, 26, 0.85)" : "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.2;
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.22);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.3, "rgba(6, 182, 212, 0.6)");
    grad.addColorStop(0.7, "rgba(249, 115, 26, 0.3)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    texture.needsUpdate = true;
  };

  update(0);
  return { texture, update };
}

interface DissolveSceneProps {
  dissolveProgress: ReturnType<typeof useTransform<number, number>>;
}

const DissolveScene = ({ dissolveProgress }: DissolveSceneProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const invalidate = useThree((state) => state.invalidate);
  const liveTexRef = useRef<THREE.CanvasTexture | null>(null);

  const { texture: fallbackTexture, update } = useMemo(() => {
    return createProceduralVortexTexture();
  }, []);

  useEffect(() => {
    return dissolveProgress.on("change", () => invalidate());
  }, [invalidate, dissolveProgress]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: fallbackTexture },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uDissolve: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uGrayscale: { value: 0 },
      uEdgeIntensity: { value: 0 },
      uEdgeBrightness: { value: 1.0 },
    }),
    [fallbackTexture, size.width, size.height]
  );

  useFrame((state) => {
    const progress = THREE.MathUtils.clamp(dissolveProgress.get(), 0, 1);
    if (progress <= 0.001 || progress >= 1.0) {
      return;
    }

    const time = state.clock.getElapsedTime();

    // Directly bind to the live vortex canvas rendered in the DOM
    if (!liveTexRef.current && typeof document !== "undefined") {
      const vCanvas = document.querySelector(".vortex-webgl-canvas") as HTMLCanvasElement;
      if (vCanvas && vCanvas.width > 0) {
        const tex = new THREE.CanvasTexture(vCanvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        liveTexRef.current = tex;
      }
    }

    if (liveTexRef.current) {
      liveTexRef.current.needsUpdate = true;
      if (materialRef.current && materialRef.current.uniforms.uTexture.value !== liveTexRef.current) {
        materialRef.current.uniforms.uTexture.value = liveTexRef.current;
      }
    } else {
      update(time);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      materialRef.current.uniforms.uDissolve.value = progress;
      const grayscaleProgress = Math.min(1.0, progress / 0.45);
      materialRef.current.uniforms.uGrayscale.value = grayscaleProgress;
      materialRef.current.uniforms.uEdgeIntensity.value = progress * 0.8;
      materialRef.current.uniforms.uEdgeBrightness.value = 1.0 - progress * 0.4;
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={coverVertexShader}
        fragmentShader={coverFragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export default function VortexAbout() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 960);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Continuous scroll track dedicated to Vortex, Dual Info Flank, and Tail Dissolve
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Responsive spring with high stiffness ensuring crisp, zero-lag response to smooth scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 26,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Dynamic pointer-events delegation (Requirement R4):
  // When smoothProgress >= 0.74 (the dissolve start point), immediately release pointer events
  // so the Journey carousel behind/below receives all drags and scroll interactions without blockage.
  const vortexPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));
  const stickyPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));

  // ---------------------------------------------------------------------------------------------------
  // REVISED TIMING: LEFT CARD ONLY REVEALS ONCE FULLY IMMERSED (v >= 0.38)
  // RIGHT CARD FOLLOWS SMOOTHLY AT (v >= 0.52)
  // DISSOLVE GATED ACTIVE WINDOW (0.74 <= v <= 1.02)
  // ---------------------------------------------------------------------------------------------------
  useEffect(() => {
    return smoothProgress.on("change", (v) => {
      setLeftActive(v >= 0.38);
      setRightActive(v >= 0.52);
      setIsDissolving(v >= 0.74 && v <= 1.02);
    });
  }, [smoothProgress]);

  // ---------------------------------------------------------------------------------------------------
  // 1. VORTEX: EVOLVES FROM DOWN BEFOREHAND, REACHES IMMERSION, THEN DISSOLVES
  // ---------------------------------------------------------------------------------------------------
  const vortexY = useTransform(smoothProgress, [0.0, 0.22], ["140px", "0px"]);
  const vortexScale = useTransform(
    smoothProgress,
    [0.0, 0.28, 0.85, 1.0],
    [0.88, 1.0, 1.02, 1.05]
  );

  const vortexOpacity = useTransform(
    smoothProgress,
    [0.0, 0.15, 0.74, 0.741],
    [0.6, 1.0, 1.0, 0.0]
  );

  // ---------------------------------------------------------------------------------------------------
  // 2. LEFT INFO: HARMAN SAINI + INTRO (DELAYED UNTIL FULLY IMMERSED IN VORTEX)
  // ---------------------------------------------------------------------------------------------------
  const leftY = useTransform(smoothProgress, [0.34, 0.44], ["60px", "0px"]);
  const leftDesktopOpacity = useTransform(
    smoothProgress,
    [0.34, 0.42, 0.68, 0.76],
    [0.0, 1.0, 1.0, 0.0]
  );
  const leftMobileOpacity = useTransform(
    smoothProgress,
    [0.34, 0.42, 0.52, 0.60],
    [0.0, 1.0, 1.0, 0.0]
  );
  const leftOpacity = isMobile ? leftMobileOpacity : leftDesktopOpacity;

  // ---------------------------------------------------------------------------------------------------
  // 3. RIGHT INFO: DISCIPLINE & CAPABILITIES (FOLLOWS SMOOTHLY AFTER LEFT INFO)
  // ---------------------------------------------------------------------------------------------------
  const rightY = useTransform(smoothProgress, [0.50, 0.60], ["60px", "0px"]);
  const rightDesktopOpacity = useTransform(
    smoothProgress,
    [0.50, 0.58, 0.72, 0.78],
    [0.0, 1.0, 1.0, 0.0]
  );
  const rightMobileOpacity = useTransform(
    smoothProgress,
    [0.58, 0.66, 0.74, 0.80],
    [0.0, 1.0, 1.0, 0.0]
  );
  const rightOpacity = isMobile ? rightMobileOpacity : rightDesktopOpacity;

  // ---------------------------------------------------------------------------------------------------
  // 4. TAIL-END NATIVE GLSL SOBEL EDGE & FBM NOISE DISSOLVE TIMELINE
  // ---------------------------------------------------------------------------------------------------
  const dissolveNormalized = useTransform(smoothProgress, [0.74, 0.98], [0, 1]);
  const dissolveLayerOpacity = useTransform(smoothProgress, [0.74, 0.741, 0.99, 1.0], [0, 1, 1, 0]);
  const dissolveHudOpacity = useTransform(smoothProgress, [0.78, 0.83, 0.94, 0.98], [0, 1, 1, 0]);

  // Initial scroll hint
  const hintOpacity = useTransform(smoothProgress, [0.0, 0.10], [1, 0]);

  return (
    <div ref={trackRef} className="sj-track">
      <motion.div className="sj-sticky" style={{ pointerEvents: stickyPointerEvents }}>
        {/* =====================================================================
             LAYER 1: 3D WEBGL VORTEX
             ===================================================================== */}
        <motion.div
          className="sj-vortex-layer"
          style={{
            y: vortexY,
            scale: vortexScale,
            opacity: vortexOpacity,
            pointerEvents: vortexPointerEvents,
          }}
        >
          <Vortex
            background="#000000"
            dots
            comets
            direction="right"
            className="w-full h-full"
          />
        </motion.div>

        {/* =====================================================================
             LAYER 2: LEFT INFO (DELAYS UNTIL FULL IMMERSION, GOOEY TEXT REVEAL)
             ===================================================================== */}
        <div className="sj-about-container">
          <motion.div
            className="sj-text-flow"
            style={{
              y: leftY,
              opacity: leftOpacity,
            }}
          >
            <div className="sj-tag-row">
              <span className="sj-pulse-dot cyan" />
              <span className="sj-tag-label">01 // SYSTEMS ARCHITECT</span>
            </div>

            <GooeyTextReveal
              mode="immediate"
              trigger={leftActive}
              duration={1.2}
              blurAmount={0.3}
              ease="power3.out"
            >
              <h2 className="sj-heading">Harman Saini</h2>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={leftActive}
              duration={1.2}
              delay={0.15}
              blurAmount={0.25}
            >
              <p className="sj-subheading text-cyan-400">
                Full-Stack Systems Architect &amp; 3D Spatial Engineer
              </p>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={leftActive}
              duration={1.3}
              delay={0.25}
              blurAmount={0.2}
            >
              <p className="sj-paragraph">
                Specializing in thread-safe Java microservices, algorithmic financial
                execution pipelines, and WebGL rendering. I bridge low-latency computational
                throughput with tactile visual aesthetics.
              </p>
            </GooeyTextReveal>

            <div className="sj-tech-pills">
              {[
                "Distributed Systems",
                "Java 21",
                "Three.js / WebGL",
                "Next.js 16",
                "Kafka & Redis",
                "Lock-Free Queues",
                "Custom GLSL",
              ].map((tech) => (
                <span key={tech} className="sj-tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            <div className="sj-metrics-row">
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot cyan" />
                <span>&lt;10ms Latency</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot indigo" />
                <span>120 FPS WebGL</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot cyan" />
                <span>99.99% Uptime</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =====================================================================
             LAYER 3: RIGHT INFO (FOLLOWS SMOOTHLY AFTER LEFT INFO)
             ===================================================================== */}
        <div className="sj-right-container">
          <motion.div
            className="sj-text-flow"
            style={{
              y: rightY,
              opacity: rightOpacity,
            }}
          >
            <div className="sj-tag-row">
              <span className="sj-pulse-dot indigo" />
              <span className="sj-tag-label">02 // DISCIPLINE &amp; CAPABILITIES</span>
            </div>

            <GooeyTextReveal
              mode="immediate"
              trigger={rightActive}
              duration={1.2}
              blurAmount={0.3}
              ease="power3.out"
            >
              <h2 className="sj-heading">Algorithmic Precision &amp; Spatial Computation</h2>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={rightActive}
              duration={1.2}
              delay={0.15}
              blurAmount={0.25}
            >
              <p className="sj-subheading text-indigo-400">
                Deterministic Event Streams &amp; Concurrency
              </p>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={rightActive}
              duration={1.3}
              delay={0.25}
              blurAmount={0.2}
            >
              <p className="sj-paragraph">
                Engineering deterministic event streams, lock-free ring buffers, and
                hardware-accelerated GLSL compute shaders. Designed for extreme fault
                tolerance and zero garbage collection pauses.
              </p>
            </GooeyTextReveal>

            <div className="sj-tech-pills">
              {[
                "Zero-Lock Concurrency",
                "GLSL Shaders",
                "Raft Consensus",
                "Micro-Pipelines",
                "Event Streams",
                "WebGPU Matrix",
                "eBPF & NetOps",
              ].map((tech) => (
                <span key={tech} className="sj-tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            <div className="sj-metrics-row">
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot indigo" />
                <span>Sub-10ms Core</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot cyan" />
                <span>Zero-Lock RAM</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot indigo" />
                <span>Raft Engine</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =====================================================================
             LAYER 4: NATIVE SOBEL EDGE & FBM NOISE DISSOLVE PIPELINE
             Seamlessly dissolves the live vortex track without container jump
             ===================================================================== */}
        <motion.div
          className="sj-dissolve-layer"
          style={{ opacity: dissolveLayerOpacity }}
        >
          <Canvas dpr={1} frameloop={isDissolving ? "always" : "never"} gl={{ antialias: false, alpha: true }}>
            <OrthographicCamera
              makeDefault
              manual
              left={-1}
              right={1}
              top={1}
              bottom={-1}
              near={0.1}
              far={10}
              position={[0, 0, 1]}
            />
            <DissolveScene dissolveProgress={dissolveNormalized} />
          </Canvas>
        </motion.div>

        {/* Telemetry HUD displaying transition status */}
        <motion.div
          className="sj-dissolve-hud"
          style={{ opacity: dissolveHudOpacity }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/40 bg-black/75 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[0.68rem] font-mono tracking-widest text-cyan-300 uppercase font-semibold">
              VORTEX DISSOLVE // TRANSITIONING TO JOURNEY
            </span>
          </div>
        </motion.div>

        {/* =====================================================================
             SCROLL EXPLORATION HINT
             ===================================================================== */}
        <motion.div className="sj-scroll-hint" style={{ opacity: hintOpacity }} aria-hidden>
          <div className="sj-mouse-icon">
            <div className="sj-mouse-wheel" />
          </div>
          <span>Scroll to Explore</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
