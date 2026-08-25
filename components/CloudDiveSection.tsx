'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import './CloudDiveSection.css';

export default function CloudDiveSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 45,
        damping: 20,
        restDelta: 0.001,
    });

    // Typography header fading out as camera penetrates the cloud
    const titleOpacity = useTransform(smoothProgress, [0.08, 0.35], [1, 0]);
    const titleY = useTransform(smoothProgress, [0.08, 0.35], ['0px', '-60px']);

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
        scene.fog = new THREE.FogExp2(0x000000, 0.018);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 80);

        // Procedural Soft Cloud Texture Generation
        const createCloudTexture = () => {
            const canvasEl = document.createElement('canvas');
            canvasEl.width = 128;
            canvasEl.height = 128;
            const ctx = canvasEl.getContext('2d')!;
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
            gradient.addColorStop(0.35, 'rgba(180, 200, 255, 0.4)');
            gradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);

            const texture = new THREE.CanvasTexture(canvasEl);
            texture.needsUpdate = true;
            return texture;
        };

        const cloudTex = createCloudTexture();
        const cloudGeo = new THREE.PlaneGeometry(35, 35);
        const cloudMat = new THREE.MeshBasicMaterial({
            map: cloudTex,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        // Generate Volumetric Cloud Bank
        const cloudCount = 140;
        const clouds: THREE.Mesh[] = [];
        const cloudGroup = new THREE.Group();

        for (let i = 0; i < cloudCount; i++) {
            const mesh = new THREE.Mesh(cloudGeo, cloudMat);
            mesh.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 45,
                -Math.random() * 220 + 40
            );
            mesh.rotation.z = Math.random() * Math.PI * 2;
            const scale = 0.8 + Math.random() * 1.6;
            mesh.scale.set(scale, scale, 1);
            clouds.push(mesh);
            cloudGroup.add(mesh);
        }
        scene.add(cloudGroup);

        // Ambient floating star dust inside the cloud bank
        const dustCount = 300;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount * 3; i += 3) {
            dustPos[i] = (Math.random() - 0.5) * 100;
            dustPos[i + 1] = (Math.random() - 0.5) * 60;
            dustPos[i + 2] = -Math.random() * 250 + 50;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.3,
            color: 0xa5b4fc,
            transparent: true,
            opacity: 0.8,
        });
        const dustParticles = new THREE.Points(dustGeo, dustMat);
        scene.add(dustParticles);

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

        const render = () => {
            rafId = requestAnimationFrame(render);
            const time = (performance.now() - startTime) / 1000;
            const progress = smoothProgress.get();

            // Camera dives forward through the cloud bank on scroll
            camera.position.z = 80 - progress * 240;
            camera.position.x = Math.sin(time * 0.4) * 2.5;
            camera.position.y = Math.cos(time * 0.3) * 1.5;

            // Gentle cloud billow rotation
            clouds.forEach((c, idx) => {
                c.rotation.z += (idx % 2 === 0 ? 0.001 : -0.001);
            });

            renderer.render(scene, camera);
        };

        render();

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            cloudTex.dispose();
            cloudGeo.dispose();
            cloudMat.dispose();
            dustGeo.dispose();
            dustMat.dispose();
        };
    }, [smoothProgress]);

    return (
        <div ref={containerRef} className="cld-track">
            <div className="cld-sticky">
                <canvas ref={canvasRef} className="cld-canvas" />

                <motion.div
                    className="cld-headline-block"
                    style={{ opacity: titleOpacity, y: titleY }}
                >
                    <div className="cld-eyebrow">[05 // TRANSCENDENCE LAYER]</div>
                    <h2 className="cld-title">Entering the Spatial Nebula</h2>
                    <p className="cld-subtitle">Dive deep into the cloud bank to explore production architectures.</p>
                </motion.div>
            </div>
        </div>
    );
}