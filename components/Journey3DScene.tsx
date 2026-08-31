'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { type MotionValue } from 'framer-motion';

interface Journey3DSceneProps {
    scrollProgress: MotionValue<number>;
}

export default function Journey3DScene({ scrollProgress }: Journey3DSceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        let width = parent ? parent.clientWidth : window.innerWidth;
        let height = parent ? parent.clientHeight : window.innerHeight;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 10);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        scene.add(ambientLight);

        const light1 = new THREE.PointLight(0x6366f1, 6, 25);
        light1.position.set(4, 4, 6);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x06b6d4, 6, 25);
        light2.position.set(-4, -4, 6);
        scene.add(light2);

        const light3 = new THREE.PointLight(0x10b981, 6, 25);
        light3.position.set(0, 5, 2);
        scene.add(light3);

        // ── Model 1: School (Mathematical Logic Octahedron) ──
        const schoolGroup = new THREE.Group();
        const octGeo = new THREE.OctahedronGeometry(1.5, 0);
        const octMat = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            roughness: 0.2,
            metalness: 0.85,
        });
        const octMesh = new THREE.Mesh(octGeo, octMat);
        schoolGroup.add(octMesh);

        const octWire = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.85, 1),
            new THREE.MeshBasicMaterial({ color: 0xa5b4fc, wireframe: true, transparent: true, opacity: 0.55 })
        );
        schoolGroup.add(octWire);

        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(2.3, 0.04, 16, 100),
            new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7 })
        );
        ring1.rotation.x = Math.PI / 3;
        schoolGroup.add(ring1);
        scene.add(schoolGroup);

        // ── Model 2: College (Cyber Matrix Icosahedron) ──
        const collegeGroup = new THREE.Group();
        const icoGeo = new THREE.IcosahedronGeometry(1.5, 0);
        const icoMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            roughness: 0.15,
            metalness: 0.9,
        });
        const icoMesh = new THREE.Mesh(icoGeo, icoMat);
        collegeGroup.add(icoMesh);

        const icoWire = new THREE.Mesh(
            new THREE.IcosahedronGeometry(2.05, 1),
            new THREE.MeshBasicMaterial({ color: 0x67e8f9, wireframe: true, transparent: true, opacity: 0.6 })
        );
        collegeGroup.add(icoWire);

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(2.6, 0.05, 16, 100),
            new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.75 })
        );
        ring2.rotation.y = Math.PI / 4;
        collegeGroup.add(ring2);
        scene.add(collegeGroup);

        // ── Model 3: University (Quantum Distributed Torus Knot) ──
        const uniGroup = new THREE.Group();
        const torusKnotGeo = new THREE.TorusKnotGeometry(1.2, 0.34, 128, 32, 2, 3);
        const torusKnotMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            roughness: 0.2,
            metalness: 0.85,
        });
        const torusKnotMesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);
        uniGroup.add(torusKnotMesh);

        const torusWire = new THREE.Mesh(
            new THREE.TorusKnotGeometry(1.32, 0.38, 64, 16, 2, 3),
            new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.45 })
        );
        uniGroup.add(torusWire);

        const particleCount = 120;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            pPos[i] = (Math.random() - 0.5) * 6.5;
            pPos[i + 1] = (Math.random() - 0.5) * 6.5;
            pPos[i + 2] = (Math.random() - 0.5) * 6.5;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.08, color: 0x34d399, transparent: true, opacity: 0.85 });
        const pMesh = new THREE.Points(pGeo, pMat);
        uniGroup.add(pMesh);
        scene.add(uniGroup);

        const onResize = () => {
            if (!canvas || !canvas.parentElement) return;
            width = canvas.parentElement.clientWidth;
            height = canvas.parentElement.clientHeight;
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        let rafId = 0;
        const startTime = performance.now();
        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

        const render = () => {
            rafId = requestAnimationFrame(render);
            const time = (performance.now() - startTime) / 1000;
            const progress = scrollProgress.get();

            octMesh.rotation.y = time * 0.6;
            octMesh.rotation.x = time * 0.4;
            octWire.rotation.y = -time * 0.3;
            ring1.rotation.z = time * 0.5;

            icoMesh.rotation.x = time * 0.5;
            icoMesh.rotation.y = time * 0.7;
            icoWire.rotation.z = -time * 0.4;
            ring2.rotation.x = time * 0.6;

            torusKnotMesh.rotation.x = time * 0.6;
            torusKnotMesh.rotation.y = time * 0.8;
            torusWire.rotation.z = time * 0.3;
            pMesh.rotation.y = time * 0.15;

            const isDesktop = width > 768;

            // School: Pop-in forward from Z = -8 to Z = 0
            const sT = 1 - Math.abs(progress - 0.20) / 0.15;
            const sScale = clamp(sT, 0, 1);
            const sZ = (1 - clamp(progress / 0.20, 0, 1)) * -8;
            schoolGroup.scale.set(sScale, sScale, sScale);
            schoolGroup.position.set(isDesktop ? -2.7 : 0, isDesktop ? 0 : 1.3, sZ);

            // College: Active in range 0.38 to 0.69 (Positioned Right)
            const cT = 1 - Math.abs(progress - 0.53) / 0.15;
            const cScale = clamp(cT, 0, 1);
            collegeGroup.scale.set(cScale, cScale, cScale);
            collegeGroup.position.set(isDesktop ? 2.7 : 0, isDesktop ? 0 : 1.3, 0);

            // University: Active in range 0.71 to 1.00 (Positioned Left)
            const uT = 1 - Math.abs(progress - 0.87) / 0.15;
            const uScale = clamp(uT, 0, 1);
            uniGroup.scale.set(uScale, uScale, uScale);
            uniGroup.position.set(isDesktop ? -2.7 : 0, isDesktop ? 0 : 1.3, 0);

            renderer.render(scene, camera);
        };

        render();

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            octGeo.dispose();
            octMat.dispose();
            octWire.geometry.dispose();
            ring1.geometry.dispose();
            icoGeo.dispose();
            icoMat.dispose();
            icoWire.geometry.dispose();
            ring2.geometry.dispose();
            torusKnotGeo.dispose();
            torusKnotMat.dispose();
            torusWire.geometry.dispose();
            pGeo.dispose();
            pMat.dispose();
        };
    }, [scrollProgress]);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 4,
            }}
        >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
}