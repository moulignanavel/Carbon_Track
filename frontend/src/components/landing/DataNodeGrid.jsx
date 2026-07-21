import { useEffect, useRef } from 'react';

/**
 * DataNodeGrid Component
 * ─────────────────────────────────────────────────────────────
 * Renders an animated network graph of floating data nodes
 * connected by faint green light lines. Improves contrast
 * and legibility for landing content in dark theme.
 */
export default function DataNodeGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Calculate node density based on screen size
    const nodeCount = Math.min(45, Math.floor((width * height) / 32000) + 15);
    const nodes = [];

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, // horizontal drift speed
        vy: -Math.random() * 0.25 - 0.05, // vertical upward drift speed
        radius: Math.random() * 2.5 + 1.5,
        opacity: Math.random() * 0.4 + 0.3,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Clear with full transparency so background CSS gradient shows through
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];

          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 140; // max connection distance
          if (dist < maxDist) {
            const opacityFactor = 1 - dist / maxDist;
            const lineOpacity = opacityFactor * 0.12;

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(74, 222, 128, ${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 2. Draw and update nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        n.x += n.vx;
        n.y += n.vy;

        // Wrap around horizontal boundaries
        if (n.x < -10) n.x = width + 10;
        else if (n.x > width + 10) n.x = -10;

        // Reset to bottom if node leaves top
        if (n.y < -10) {
          n.y = height + 10;
          n.x = Math.random() * width;
        }

        n.pulsePhase += n.pulseSpeed;
        const currentOpacity = n.opacity + Math.sin(n.pulsePhase) * 0.15;

        // Subtle outer glass glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${currentOpacity * 0.15})`;
        ctx.fill();

        // Emerald node core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 243, 208, ${currentOpacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
