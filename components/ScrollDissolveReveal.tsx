"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { useScroll, motion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

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
 * Procedural Dynamic 3D WebGL Vortex Canvas Texture
 * Generates living cosmic spiral strands, comet tails & high-contrast vortex core with ZERO PNGs
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

    // Draw multi-layered swirling vortex lines matching the 3D vortex
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
      ctx.lineWidth = (i % 3 === 0 ? 2.5 : 1.2);
      ctx.stroke();
    }

    // Core high-energy singularity
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
  scrollYProgress: any;
}

const DissolveScene = ({ scrollYProgress }: DissolveSceneProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const invalidate = useThree((state) => state.invalidate);
  const liveTexRef = useRef<THREE.CanvasTexture | null>(null);

  const { texture: fallbackTexture, update } = useMemo(() => {
    return createProceduralVortexTexture();
  }, []);

  useEffect(() => {
    return scrollYProgress.on("change", () => invalidate());
  }, [invalidate, scrollYProgress]);

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
    const time = state.clock.getElapsedTime();

    // Check for live vortex canvas in DOM to dissolve the real 3D vortex directly with zero PNGs
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

    const progress = scrollYProgress.get();

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

export interface ScrollDissolveRevealProps {
  className?: string;
  containerClassName?: string;
  onDissolveComplete?: () => void;
}

export function ScrollDissolveReveal({
  className,
  containerClassName,
}: ScrollDissolveRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth dissolve progress
  const bannerOpacity = useTransform(scrollYProgress, [0.0, 0.2, 0.65], [1, 1, 0]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-[220vh] w-full bg-black", containerClassName)}
    >
      <div className={cn("sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center", className)}>
        {/* Real-time WebGL Sobel Dissolve Shader acting directly on Vortex */}
        <Canvas dpr={1} frameloop="always" gl={{ antialias: false, alpha: true }}>
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
          <DissolveScene scrollYProgress={scrollYProgress} />
        </Canvas>

        {/* Telemetry HUD displaying transition status */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-center z-20"
          style={{ opacity: bannerOpacity }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-black/60 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[0.68rem] font-mono tracking-widest text-cyan-300 uppercase">
              VORTEX DISSOLVE // TRANSITIONING TO JOURNEY
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ScrollDissolveReveal;
