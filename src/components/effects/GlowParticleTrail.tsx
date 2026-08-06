"use client";

import { useCallback, useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

/**
 * Glowing mouse-follow particle trail.
 * Renders a canvas overlay that spawns emerald particles on mouse move.
 * ONLY for the landing page.
 * - Reduced glow size on all devices
 * - On mobile (touch): only spawns on vertical scroll, not horizontal swipe
 */
export default function GlowParticleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100, active: false });
  const animFrameRef = useRef<number>(0);
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isMobileRef = useRef(false);

  const spawn = useCallback((x: number, y: number) => {
    // Reduced count and size for subtler effect
    const count = 1 + Math.floor(Math.random() * 2);
    const sizeMultiplier = isMobileRef.current ? 0.55 : 0.7;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.5;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        size: (1.2 + Math.random() * 1.8) * sizeMultiplier,
        hue: 150 + Math.random() * 20, // emerald hue range
      });
    }
    // cap particles
    if (particlesRef.current.length > 200) {
      particlesRef.current = particlesRef.current.slice(-200);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect mobile/touch device
    isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      spawn(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        lastTouchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;

      const last = lastTouchRef.current;
      lastTouchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };

      if (!last) return;

      // Calculate movement delta
      const dx = Math.abs(t.clientX - last.x);
      const dy = Math.abs(t.clientY - last.y);

      // Only spawn particles on predominantly VERTICAL movement (scrolling)
      // Ignore horizontal swipes: require vertical movement to be at least 2x horizontal
      if (dy > dx * 2 && dy > 3) {
        mouseRef.current = { x: t.clientX, y: t.clientY, active: true };
        spawn(t.clientX, t.clientY);
      }
    };

    const onTouchEnd = () => {
      lastTouchRef.current = null;
      mouseRef.current.active = false;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01; // slight gravity

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.7;
        const size = p.size * (1 - progress * 0.5);

        // glow — reduced radius (size * 2 instead of size * 3)
        ctx.save();
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, 1)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 1)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [spawn]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    />
  );
}
