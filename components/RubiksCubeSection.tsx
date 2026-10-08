// components/RubiksCubeSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, useScroll, useSpring } from 'framer-motion';

interface RubiksCubeSectionProps {
  visibility?: number;
  openProgress?: number;
  className?: string;
}

// 27 distinct cutting-edge tech stacks for each of the 27 cubies
export interface TechStack {
  id: string;
  name: string;
  sub: string;
  color: string;
  tag: string;
  desc: string;
}

export const CUBIE_TECHS: TechStack[] = [
  { id: 'java', name: 'JAVA 21', sub: 'VIRTUAL THREADS', color: '#f59e0b', tag: 'CORE', desc: 'Lock-free concurrency & sub-10ms microservices' },
  { id: 'kafka', name: 'KAFKA', sub: 'EVENT STREAMS', color: '#ef4444', tag: 'STREAM', desc: 'Fault-tolerant distributed pub/sub pipelines' },
  { id: 'redis', name: 'REDIS', sub: 'IN-MEMORY CACHE', color: '#dc2626', tag: 'CACHE', desc: 'Sub-millisecond latency distributed key-value cache' },
  { id: 'threejs', name: 'THREE.JS', sub: '3D SPATIAL WEB', color: '#06b6d4', tag: '3D', desc: '120 FPS WebGL scene graph & custom geometry pipelines' },
  { id: 'webgl', name: 'WEBGL', sub: 'GLSL SHADERS', color: '#38bdf8', tag: 'GPU', desc: 'Hardware-accelerated compute & procedural fragment shaders' },
  { id: 'nextjs', name: 'NEXT.JS 16', sub: 'TURBOPACK SSR', color: '#2563eb', tag: 'STACK', desc: 'Full-stack App Router with zero-bundle-size server components' },
  { id: 'react', name: 'REACT 19', sub: 'SERVER ACTIONS', color: '#0284c7', tag: 'UI', desc: 'Reactive UI state reconciliation & concurrent transitions' },
  { id: 'typescript', name: 'TYPESCRIPT', sub: 'STATIC TYPINGS', color: '#3178c6', tag: 'TYPE', desc: 'Strict compile-time type safety & AST metaprogramming' },
  { id: 'spring', name: 'SPRING BOOT', sub: 'MICROSERVICES', color: '#10b981', tag: 'BACKEND', desc: 'Enterprise Java frameworks with reactive WebFlux routing' },
  { id: 'docker', name: 'DOCKER', sub: 'CONTAINERS', color: '#0284c7', tag: 'DEVOPS', desc: 'Lightweight reproducible execution container runtimes' },
  { id: 'k8s', name: 'KUBERNETES', sub: 'ORCHESTRATION', color: '#326ce5', tag: 'CLOUD', desc: 'Automated horizontal auto-scaling & zero-downtime rollouts' },
  { id: 'distributed', name: 'DISTRIBUTED', sub: 'FAULT TOLERANT', color: '#a855f7', tag: 'SYSTEMS', desc: 'Consensus algorithms, Raft protocol, & partitioned state' },
  { id: 'zerolock', name: 'ZERO-LOCK', sub: 'RING BUFFERS', color: '#ec4899', tag: 'PERF', desc: 'Mechanical sympathy & lock-free concurrent memory arrays' },
  { id: 'postgres', name: 'POSTGRESQL', sub: 'ACID DATABASE', color: '#336791', tag: 'STORAGE', desc: 'Relational data persistence with WAL replication' },
  { id: 'graphql', name: 'GRAPHQL', sub: 'FEDERATED APIS', color: '#e535ab', tag: 'QUERY', desc: 'Declarative data fetching with strict schema contracts' },
  { id: 'python', name: 'PYTHON', sub: 'DATA PIPELINES', color: '#3776ab', tag: 'SCRIPT', desc: 'Algorithmic prototyping, analytical workflows & scripts' },
  { id: 'pytorch', name: 'PYTORCH', sub: 'TENSOR COMPUTE', color: '#ee4c2c', tag: 'AI', desc: 'Deep learning matrix compute & neural network architectures' },
  { id: 'cpp', name: 'C++', sub: 'HIGH SPEED CORE', color: '#00599c', tag: 'NATIVE', desc: 'Deterministic bare-metal memory control & pointer arithmetic' },
  { id: 'rust', name: 'RUST', sub: 'MEMORY SAFETY', color: '#dea584', tag: 'SYSTEMS', desc: 'Zero-cost abstractions with fearless compile-time safety' },
  { id: 'aws', name: 'AWS CLOUD', sub: 'INFRASTRUCTURE', color: '#ff9900', tag: 'SCALE', desc: 'High-availability global VPC cloud infrastructure & S3' },
  { id: 'fintech', name: 'LOW LATENCY', sub: '<10MS EXECUTION', color: '#eab308', tag: 'FINTECH', desc: 'High-frequency algorithmic order execution architectures' },
  { id: 'tailwind', name: 'TAILWIND', sub: 'CYBER UI STYLING', color: '#38bdf8', tag: 'STYLE', desc: 'Utility-first modern design token styling engine' },
  { id: 'linux', name: 'LINUX', sub: 'KERNEL & NETOPS', color: '#ca8a04', tag: 'OS', desc: 'Unix systems programming, eBPF & socket network tuning' },
  { id: 'cicd', name: 'GIT & CI/CD', sub: 'AUTOMATED OPS', color: '#f05032', tag: 'PIPELINE', desc: 'Automated static analysis, regression gates, & deploy pipelines' },
  { id: 'rest', name: 'REST APIS', sub: 'HIGH THROUGHPUT', color: '#8b5cf6', tag: 'NETWORK', desc: 'Stateless HTTP/2 JSON & gRPC serialization protocols' },
  { id: 'spatial', name: 'SPATIAL 3D', sub: '120 FPS ENGINE', color: '#0891b2', tag: 'VISION', desc: 'Immersive tactile WebGL shaders & spatial math' },
  { id: 'algorithms', name: 'ALGORITHMS', sub: 'DYNAMIC SOLVERS', color: '#14b8a6', tag: 'MATH', desc: 'Graph theory, dynamic programming & asymptotic optimization' },
];

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

/**
 * Classic Rubik's Palette Texture Generator
 * Features rounded glossy sticker with black plastic perimeter bevel
 */
function createRubiksStickerTexture(faceColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Black plastic core bevel
  ctx.fillStyle = '#111216';
  ctx.fillRect(0, 0, size, size);

  // Classic colored sticker with rounded corners
  ctx.fillStyle = faceColor;
  drawRoundedRect(ctx, 16, 16, size - 32, size - 32, 24);
  ctx.fill();

  // Subtle gloss reflection edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 20, 20, size - 40, size - 40, 20);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Carpet Mode: Clean White Box Tech Texture Generator
 * Renders the tech stack cleanly on an elegant white box
 */
function createWhiteBoxTechTexture(tech: TechStack): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Clean, crisp white box background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Subtle elegant box border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, size - 14, size - 14);

  // Top color accent bar
  ctx.fillStyle = tech.color;
  ctx.fillRect(20, 20, size - 40, 16);

  // Clean Tag Badge Pill
  ctx.fillStyle = `${tech.color}18`;
  drawRoundedRect(ctx, 36, 56, 140, 46, 10);
  ctx.fill();
  ctx.strokeStyle = tech.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = tech.color;
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tech.tag, 106, 79);

  // Bold High-Contrast Tech Name (Dark charcoal typography)
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 50px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(tech.name, 36, 215);

  // High-Contrast Subtitle
  ctx.fillStyle = tech.color;
  ctx.font = 'bold 24px monospace';
  ctx.fillText(tech.sub, 36, 268);

  // Clear descriptive summary
  ctx.fillStyle = '#475569';
  ctx.font = '500 20px monospace';
  ctx.fillText(tech.desc.length > 34 ? tech.desc.slice(0, 32) + '...' : tech.desc, 36, 325);

  // Bottom colored status stripe
  ctx.fillStyle = tech.color;
  ctx.fillRect(36, 440, size - 72, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function RubiksCubeSection({
  className = '',
}: RubiksCubeSectionProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const magnetGroupRef = useRef<THREE.Group | null>(null);

  // Scroll Tracking for "Inn to Out" scaling
  const { scrollYProgress } = useScroll({
    target: mountRef,
    offset: ['start end', 'center center'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // Carpet Unfold State: false = rotating 3D Rubik's cube, true = unfolded flat rectangular carpet
  const [isCarpetUnfolded, setIsCarpetUnfolded] = useState(false);
  const carpetUnfoldRef = useRef(0);

  const cubiesRef = useRef<{
    mesh: THREE.Mesh;
    tech: TechStack;
    cubePos: THREE.Vector3;
    carpetPos: THREE.Vector3;
    carpetRot: THREE.Euler;
    cubeMats: THREE.Material[];
    carpetMats: THREE.Material[];
  }[]>([]);

  const isDraggingRef = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.0035, y: 0.002 });
  const dragDistanceRef = useRef(0);

  // Active highlighted tech stack
  const [activeTech, setActiveTech] = useState<TechStack>(CUBIE_TECHS[0]);

  const toggleCarpet = useCallback(() => {
    setIsCarpetUnfolded((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 9.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(width, height);
    // HD 4K Quality Rendering Check - allowing full device capability instead of capped
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    // =======================================================
    // ELECTROMAGNETIC BASE / MAGNET
    // =======================================================
    const magnetGroup = new THREE.Group();
    magnetGroup.position.set(0, -2.4, 0);
    magnetGroupRef.current = magnetGroup;
    scene.add(magnetGroup);

    const magnetBaseGeom = new THREE.CylinderGeometry(2.4, 2.8, 0.45, 32);
    const magnetBaseMat = new THREE.MeshStandardMaterial({
      color: 0x090d1a,
      metalness: 0.92,
      roughness: 0.18,
    });
    const magnetBase = new THREE.Mesh(magnetBaseGeom, magnetBaseMat);
    magnetGroup.add(magnetBase);

    const coilGeom = new THREE.TorusGeometry(2.35, 0.08, 16, 48);
    const coilMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const coilMesh1 = new THREE.Mesh(coilGeom, coilMatCyan);
    coilMesh1.rotation.x = Math.PI / 2;
    coilMesh1.position.y = 0.24;
    magnetGroup.add(coilMesh1);

    const coilMesh2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.06, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    coilMesh2.rotation.x = Math.PI / 2;
    coilMesh2.position.y = 0.26;
    magnetGroup.add(coilMesh2);

    const levitationLight = new THREE.PointLight(0x00f0ff, 12, 18);
    levitationLight.position.set(0, -1.2, 0);
    scene.add(levitationLight);

    // =======================================================
    // PREPARE MATERIALS: CLASSIC RUBIK'S PALETTE + CLEAN WHITE BOXES
    // =======================================================
    const classicColors = {
      red: '#b71234',     // +X (Right)
      orange: '#ff5800',  // -X (Left)
      white: '#ffffff',   // +Y (Top)
      yellow: '#ffd500',  // -Y (Bottom)
      green: '#009b48',   // +Z (Front)
      blue: '#0045ad',    // -Z (Back)
      plastic: '#111216', // Core black plastic
    };

    const rubiksMats = {
      red: new THREE.MeshStandardMaterial({ map: createRubiksStickerTexture(classicColors.red), roughness: 0.3, metalness: 0.1 }),
      orange: new THREE.MeshStandardMaterial({ map: createRubiksStickerTexture(classicColors.orange), roughness: 0.3, metalness: 0.1 }),
      white: new THREE.MeshStandardMaterial({ map: createRubiksStickerTexture(classicColors.white), roughness: 0.3, metalness: 0.1 }),
      yellow: new THREE.MeshStandardMaterial({ map: createRubiksStickerTexture(classicColors.yellow), roughness: 0.3, metalness: 0.1 }),
      green: new THREE.MeshStandardMaterial({ map: createRubiksStickerTexture(classicColors.green), roughness: 0.3, metalness: 0.1 }),
      blue: new THREE.MeshStandardMaterial({ map: createRubiksStickerTexture(classicColors.blue), roughness: 0.3, metalness: 0.1 }),
      plastic: new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.5, metalness: 0.2 }),
    };

    // Clean white box side material for carpet mode
    const whiteBoxSideMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.05,
    });

    const cubeMasterGroup = new THREE.Group();
    cubeMasterGroup.position.set(0, 0.5, 0);
    cubeGroupRef.current = cubeMasterGroup;
    scene.add(cubeMasterGroup);

    const cubieSize = 0.92;
    const spacing = 1.05;
    const cubieGeom = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    const cubies: {
      mesh: THREE.Mesh;
      tech: TechStack;
      cubePos: THREE.Vector3;
      carpetPos: THREE.Vector3;
      carpetRot: THREE.Euler;
      cubeMats: THREE.Material[];
      carpetMats: THREE.Material[];
    }[] = [];

    let techIdx = 0;

    // Loop through 3x3x3 grid (27 cubies)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const tech = CUBIE_TECHS[techIdx % CUBIE_TECHS.length];

          // 1. Classic Rubik's 6-face palette:
          // 0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z, 5: -Z
          const cubeMats: THREE.Material[] = [
            x === 1 ? rubiksMats.red : rubiksMats.plastic,
            x === -1 ? rubiksMats.orange : rubiksMats.plastic,
            y === 1 ? rubiksMats.white : rubiksMats.plastic,
            y === -1 ? rubiksMats.yellow : rubiksMats.plastic,
            z === 1 ? rubiksMats.green : rubiksMats.plastic,
            z === -1 ? rubiksMats.blue : rubiksMats.plastic,
          ];

          // 2. Carpet Mode: Clean White Box Tech Texture
          const whiteTechTex = createWhiteBoxTechTexture(tech);
          const whiteTechMat = new THREE.MeshStandardMaterial({
            map: whiteTechTex,
            roughness: 0.25,
            metalness: 0.1,
          });
          const carpetMats: THREE.Material[] = [
            whiteBoxSideMat,
            whiteBoxSideMat,
            whiteTechMat,
            whiteBoxSideMat,
            whiteTechMat,
            whiteBoxSideMat,
          ];

          const mesh = new THREE.Mesh(cubieGeom, cubeMats);

          // Position 1: 3D Rubik's Cube Position
          const cubePos = new THREE.Vector3(x * spacing, y * spacing, z * spacing);
          mesh.position.copy(cubePos);
          cubeMasterGroup.add(mesh);

          // Position 2: Unfolded Carpet Position (9 columns x 3 rows flat rectangle matrix)
          const col = techIdx % 9;
          const row = Math.floor(techIdx / 9);

          const carpetSpacingX = 1.15;
          const carpetSpacingZ = 1.15;

          const carpetPos = new THREE.Vector3(
            (col - 4) * carpetSpacingX,
            -0.8 - (row - 1) * 0.1,
            (row - 1) * carpetSpacingZ
          );
          const carpetRot = new THREE.Euler(0.35, 0, 0);

          cubies.push({
            mesh,
            tech,
            cubePos,
            carpetPos,
            carpetRot,
            cubeMats,
            carpetMats,
          });

          techIdx++;
        }
      }
    }

    cubiesRef.current = cubies;

    // Initial natural cube inclination
    cubeMasterGroup.rotation.x = 0.38;
    cubeMasterGroup.rotation.y = 0.55;

    let reqId = 0;
    let isVisible = true;

    // IntersectionObserver to decouple animation loop from scroll and eliminate offscreen lag
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && mountRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = isVisible;
          isVisible = entry.isIntersecting;
          if (!wasVisible && isVisible) {
            reqId = requestAnimationFrame(animate);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(mountRef.current);
    }

    const animate = () => {
      if (!isVisible) {
        reqId = 0;
        return;
      }
      reqId = requestAnimationFrame(animate);

      const targetUnfold = carpetUnfoldRef.current;

      // Get scroll-driven scale factor ("inn to out" effect)
      const scrollP = smoothProgress.get();
      const easedScroll = 1 - Math.pow(1 - scrollP, 3); // Cubic ease out mapping
      const enterScale = THREE.MathUtils.lerp(0.001, 1.0, easedScroll);

      // Rotate magnet base continuously
      magnetGroup.rotation.y += 0.012;

      // Handle Rubik's cube rotation & unfolding animation
      if (targetUnfold < 0.5) {
        // CUBE MODE: Hover & auto-rotate smoothly on the magnet
        if (!isDraggingRef.current) {
          cubeMasterGroup.rotation.y += velocityRef.current.x;
          cubeMasterGroup.rotation.x += velocityRef.current.y;

          velocityRef.current.x *= 0.95;
          velocityRef.current.y *= 0.95;

          if (Math.abs(velocityRef.current.x) < 0.001) velocityRef.current.x = 0.004;
          if (Math.abs(velocityRef.current.y) < 0.001) velocityRef.current.y = 0.002;
        }

        const time = performance.now() * 0.0015;
        cubeMasterGroup.position.y = 0.5 + Math.sin(time) * 0.12;

        // Apply dynamically scaled size (zooming in from deep space)
        cubeMasterGroup.scale.set(enterScale, enterScale, enterScale);
        magnetGroup.scale.set(enterScale, enterScale, enterScale);

        cubies.forEach((c) => {
          c.mesh.position.lerp(c.cubePos, 0.08);
          c.mesh.rotation.x = THREE.MathUtils.lerp(c.mesh.rotation.x, 0, 0.08);
          c.mesh.rotation.y = THREE.MathUtils.lerp(c.mesh.rotation.y, 0, 0.08);
          c.mesh.rotation.z = THREE.MathUtils.lerp(c.mesh.rotation.z, 0, 0.08);
        });

        magnetGroup.visible = true;
      } else {
        // CARPET MODE: Smoothly unfold into a flat rectangle carpet structure!
        cubeMasterGroup.rotation.x = THREE.MathUtils.lerp(cubeMasterGroup.rotation.x, 0.45, 0.08);
        cubeMasterGroup.rotation.y = THREE.MathUtils.lerp(cubeMasterGroup.rotation.y, 0, 0.08);
        cubeMasterGroup.position.y = THREE.MathUtils.lerp(cubeMasterGroup.position.y, 0, 0.08);

        // Ensure scale settles properly in unfolded view
        cubeMasterGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        magnetGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);

        cubies.forEach((c) => {
          c.mesh.position.lerp(c.carpetPos, 0.09);
          c.mesh.rotation.x = THREE.MathUtils.lerp(c.mesh.rotation.x, c.carpetRot.x, 0.09);
          c.mesh.rotation.y = THREE.MathUtils.lerp(c.mesh.rotation.y, c.carpetRot.y, 0.09);
          c.mesh.rotation.z = THREE.MathUtils.lerp(c.mesh.rotation.z, c.carpetRot.z, 0.09);
        });

        magnetGroup.visible = false;
      }

      const isNarrow = camera.aspect < 1.35;
      const targetCamZ = targetUnfold > 0.5
        ? (isNarrow ? 9.5 * (1.35 / Math.max(0.48, camera.aspect)) : 9.5)
        : (camera.aspect < 1.0 ? 11.5 : 9.5);

      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (observer) observer.disconnect();
      if (reqId) cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      cubieGeom.dispose();

      Object.values(rubiksMats).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      whiteBoxSideMat.dispose();

      cubies.forEach((c) => {
        c.carpetMats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial && m.map) {
            m.map.dispose();
          }
          m.dispose();
        });
      });
    };
  }, []);

  useEffect(() => {
    carpetUnfoldRef.current = isCarpetUnfolded ? 1 : 0;
    if (cubiesRef.current) {
      cubiesRef.current.forEach((c) => {
        c.mesh.material = isCarpetUnfolded ? c.carpetMats : c.cubeMats;
      });
    }
  }, [isCarpetUnfolded]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsGrabbing(true);
    dragDistanceRef.current = 0;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;

    dragDistanceRef.current += Math.hypot(deltaX, deltaY);

    if (!isCarpetUnfolded && cubeGroupRef.current) {
      velocityRef.current = {
        x: deltaX * 0.007,
        y: deltaY * 0.007,
      };

      cubeGroupRef.current.rotation.y += deltaX * 0.007;
      cubeGroupRef.current.rotation.x += deltaY * 0.007;
    }

    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setIsGrabbing(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // If tap/click with minimal drag (< 6px), raycast to select cubie or toggle carpet
    if (dragDistanceRef.current < 6 && cameraRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const meshes = cubiesRef.current.map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = cubiesRef.current.find((c) => c.mesh === intersects[0].object);
        if (hit) {
          setActiveTech(hit.tech);
          if (!isCarpetUnfolded) {
            toggleCarpet();
          }
        }
      }
    }
  };

  return (
    <div
      ref={mountRef}
      className={`relative w-full min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-10"
        style={{
          cursor: isGrabbing ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* --- Top Header Telemetry --- */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none text-center z-20 w-[90%] max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-black/60 backdrop-blur-md mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[0.68rem] font-mono tracking-widest text-cyan-300 uppercase">
            3D SPATIAL MATRIX // 4K RUBIK ENGINE
          </span>
        </div>
        <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">
          27 High-Throughput Tech Stacks
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isCarpetUnfolded
            ? 'Rectangular carpet matrix unfolded — Click any white box cubie to inspect details'
            : 'Classic 3D Rubik\'s palette rotating on electromagnetic base — Tap to unfold'}
        </p>
      </div>

      {/* --- Minimalist Call To Action: "tap" with arrow icon (No heavy bounding box) --- */}
      <div className="absolute top-28 right-6 md:right-12 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={toggleCarpet}
          className="group flex items-center gap-2 text-slate-300 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 cursor-pointer"
        >
          <span className="text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-cyan-400 transition-colors">
            {isCarpetUnfolded ? 'fold' : 'tap'}
          </span>
          <span className="text-sm text-cyan-400 transition-transform duration-200 group-hover:translate-x-1">
            {isCarpetUnfolded ? '↓' : '→'}
          </span>
        </button>
      </div>

      {/* --- Active Highlighted Tech Stack Telemetry HUD (Bottom) --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-[92%] max-w-lg">
        <div className="p-4 rounded-2xl border border-white/15 bg-zinc-950/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span
              className="w-3.5 h-3.5 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: activeTech.color, boxShadow: `0 0 12px ${activeTech.color}` }}
            />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-white tracking-wide">
                  {activeTech.name}
                </span>
                <span
                  className="text-[0.62rem] font-mono px-2 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: `${activeTech.color}25`, color: activeTech.color }}
                >
                  {activeTech.tag}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                {activeTech.desc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleCarpet}
            className="flex-shrink-0 text-xs font-mono text-cyan-400 hover:text-white px-2.5 py-1 rounded border border-cyan-500/30 hover:border-cyan-400 transition cursor-pointer"
          >
            {isCarpetUnfolded ? '[FOLD CUBE]' : '[UNFOLD CARPET]'}
          </button>
        </div>
      </div>
    </div>
  );
}