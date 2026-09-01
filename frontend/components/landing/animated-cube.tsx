"use client";

import { useEffect, useRef } from "react";

export function AnimatedCube({ forceWhite = false }: { forceWhite?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Cube vertices
    const vertices = [
      { x: -0.8, y: -0.8, z: -0.8 },
      { x: 0.8, y: -0.8, z: -0.8 },
      { x: 0.8, y: 0.8, z: -0.8 },
      { x: -0.8, y: 0.8, z: -0.8 },
      { x: -0.8, y: -0.8, z: 0.8 },
      { x: 0.8, y: -0.8, z: 0.8 },
      { x: 0.8, y: 0.8, z: 0.8 },
      { x: -0.8, y: 0.8, z: 0.8 },
    ];

    // Faces defined by three points (origin, u-direction, v-direction)
    const faces = [
      [0, 1, 3], // Back face
      [4, 5, 7], // Front face
      [0, 1, 4], // Bottom face
      [3, 2, 7], // Top face
      [0, 3, 4], // Left face
      [1, 2, 5], // Right face
    ];

    const rotateY = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
      y: point.y,
      z: point.x * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateX = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x,
      y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
      z: point.y * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateZ = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
      y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
      z: point.z,
    });

    const render = () => {
      const isDark = forceWhite || document.documentElement.classList.contains("dark");
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = Math.min(rect.width, rect.height) * 0.32;

      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const points: { x: number; y: number; z: number; char: string }[] = [];

      // Generate points on faces
      faces.forEach(([i, j, k]) => {
        const origin = vertices[i];
        const uDir = vertices[j];
        const vDir = vertices[k];

        const steps = 12; // Matches original density (13 points per face)
        for (let uStep = 0; uStep <= steps; uStep++) {
          for (let vStep = 0; vStep <= steps; vStep++) {
            const u = uStep / steps;
            const v = vStep / steps;

            let point = {
              x: origin.x + u * (uDir.x - origin.x) + v * (vDir.x - origin.x),
              y: origin.y + u * (uDir.y - origin.y) + v * (vDir.y - origin.y),
              z: origin.z + u * (uDir.z - origin.z) + v * (vDir.z - origin.z),
            };

            // Restore tumbling animation
            point = rotateY(point, time * 0.3);
            point = rotateX(point, time * 0.4);
            point = rotateZ(point, time * 0.1);

            const depth = (point.z + 1.5) / 3; // Normalize roughly 0 to 1
            const charIndex = Math.floor(depth * (chars.length - 1));

            points.push({
              x: centerX + point.x * scale,
              y: centerY - point.y * scale,
              z: point.z,
              char: chars[Math.max(0, Math.min(charIndex, chars.length - 1))],
            });
          }
        }
      });

      // Sort by z for depth (painter's algorithm)
      points.sort((a, b) => a.z - b.z);

      // Draw points
      points.forEach((point) => {
        // Restore original strong depth fade to prevent Necker cube illusion
        const alpha = 0.1 + (point.z + 1.5) * 0.3;
        const color = isDark ? `rgba(255, 255, 255, ${Math.min(alpha, 0.9)})` : `rgba(0, 0, 0, ${Math.min(alpha, 0.9)})`;
        ctx.fillStyle = color;
        ctx.fillText(point.char, point.x, point.y);
      });

      time += 0.012;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
