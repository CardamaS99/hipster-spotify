import React, { useEffect, useRef } from 'react';

export default function AudioBackground({ isPaused }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    resize();
    window.addEventListener('resize', resize);

    const colors = [
      { r: 138, g: 43, b: 226 },  // Violet
      { r: 75, g: 0, b: 130 },    // Indigo
      { r: 255, g: 20, b: 147 },  // Deep Pink
      { r: 30, g: 144, b: 255 },  // Dodger Blue
      { r: 148, g: 0, b: 211 }    // Dark Violet
    ];

    const waves = [];
    for (let i = 0; i < 5; i++) {
      waves.push({
        y: height / 2 + (i - 2) * 100,
        length: 0.01 + i * 0.002,
        amplitude: 80 + i * 20,
        frequency: 0.01 + i * 0.005,
        color: colors[i],
        speed: 0.002 + i * 0.0005
      });
    }

    const animate = () => {
      if (!isPaused) {
        timeRef.current += 0.5;
      }

      // Degradado de fondo
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#1a0a2e');
      gradient.addColorStop(1, '#0f0520');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Dibujar ondas
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        const points = [];
        for (let x = 0; x < width; x += 5) {
          const y = wave.y + 
            Math.sin(x * wave.length + timeRef.current * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency + timeRef.current * wave.speed * 2) * (wave.amplitude / 2);
          
          points.push({ x, y });
        }

        // Dibujar la curva suave
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const { r, g, b } = wave.color;
        const alpha = 0.15 + (isPaused ? 0 : Math.sin(timeRef.current * 0.01 + index) * 0.05);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}
    />
  );
}
