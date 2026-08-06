"use client";

import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseOffset: number;
}

/**
 * Premium background floating particles for the landing page.
 * Subtle emerald dots that drift slowly with a gentle pulse.
 */
export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DOT_COUNT = 45;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialize dots on resize
      dotsRef.current = Array.from({ length: DOT_COUNT }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2,
          size: 1 + Math.random() * 2,
          alpha: 0.15 + Math.random() * 0.25,
          pulseOffset: Math.random() * Math.PI * 2,
        };
      });
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dots = dotsRef.current;

      for (const d of dots) {
        // Gentle drift with return-to-base tendency
        d.x += d.vx;
        d.y += d.vy;

        // Soft boundary wrap
        if (d.x < -20) d.x = canvas.width + 20;
        if (d.x > canvas.width + 20) d.x = -20;
        if (d.y < -20) d.y = canvas.height + 20;
        if (d.y > canvas.height + 20) d.y = -20;

        // Pulse alpha
        const pulse = Math.sin(time * 2 + d.pulseOffset) * 0.5 + 0.5;
        const alpha = d.alpha * (0.6 + pulse * 0.4);

        // Draw glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = "rgba(16, 185, 129, 1)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(52, 211, 153, 1)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw subtle connecting lines between nearby dots
      ctx.save();
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const lineAlpha = (1 - dist / 150) * 0.06;
            ctx.globalAlpha = lineAlpha;
            ctx.strokeStyle = "rgba(16, 185, 129, 1)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
