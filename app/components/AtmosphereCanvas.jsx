"use client";

import { useEffect, useRef } from "react";

export default function AtmosphereCanvas({ theme, isPlaying }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const themeRef = useRef(theme);
  const playingRef = useRef(isPlaying);

  themeRef.current = theme;
  playingRef.current = isPlaying;

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    // Particle types state
    let particles = [];
    let ripples = [];

    function initParticles() {
      particles = [];
      const currentTheme = themeRef.current;
      const count = currentTheme === "street" ? 140 : currentTheme === "campus" ? 45 : currentTheme === "hiphop" ? 50 : 35;

      for (let i = 0; i < count; i++) {
        particles.push(createParticle(currentTheme, true));
      }
    }

    function createParticle(t, initialRandomY = false) {
      const startY = initialRandomY ? Math.random() * height : -20;

      if (t === "street") {
        // Rain droplets
        return {
          type: "rain",
          x: Math.random() * (width + 200) - 100,
          y: startY,
          len: Math.random() * 28 + 16,
          speed: Math.random() * 14 + 16,
          thickness: Math.random() * 1.2 + 0.6,
          opacity: Math.random() * 0.45 + 0.15,
          slant: -3.5, // gentle diagonal rain
        };
      } else if (t === "campus") {
        // Golden falling autumn leaves / warm sun petals
        return {
          type: "leaf",
          x: Math.random() * width,
          y: startY,
          size: Math.random() * 7 + 4,
          speedY: Math.random() * 1.2 + 0.7,
          speedX: Math.random() * 1.4 - 0.7,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          oscillation: Math.random() * 100,
          oscSpeed: Math.random() * 0.02 + 0.01,
          color: Math.random() > 0.4 ? "rgba(235, 160, 80," : "rgba(245, 120, 100,",
          opacity: Math.random() * 0.5 + 0.25,
        };
      } else if (t === "hiphop") {
        // Concert stage smoke particles & floating embers
        const isEmber = Math.random() > 0.6;
        return {
          type: isEmber ? "ember" : "smoke",
          x: Math.random() * width,
          y: isEmber ? height + Math.random() * 20 : Math.random() * height,
          size: isEmber ? Math.random() * 3 + 1.5 : Math.random() * 60 + 30,
          speedY: isEmber ? -(Math.random() * 2.2 + 1.2) : -(Math.random() * 0.4 + 0.1),
          speedX: (Math.random() - 0.5) * 0.8,
          opacity: isEmber ? Math.random() * 0.7 + 0.3 : Math.random() * 0.12 + 0.03,
          color: isEmber
            ? Math.random() > 0.5 ? "rgba(255, 140, 40," : "rgba(255, 60, 40,"
            : "rgba(200, 100, 70,",
        };
      } else {
        // Classroom — gentle sun dust motes floating in sunlit air
        return {
          type: "mote",
          x: Math.random() * width,
          y: startY,
          size: Math.random() * 3.5 + 1.2,
          speedY: Math.random() * 0.5 + 0.2,
          speedX: (Math.random() - 0.5) * 0.6,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          opacity: Math.random() * 0.4 + 0.15,
        };
      }
    }

    initParticles();

    let lastTheme = themeRef.current;

    // Main animation loop
    function render() {
      // Re-init particles if theme changed
      if (lastTheme !== themeRef.current) {
        lastTheme = themeRef.current;
        initParticles();
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseOffsetX = (mouseRef.current.x - 0.5) * 25;
      const mouseOffsetY = (mouseRef.current.y - 0.5) * 15;
      const isMusicPlaying = playingRef.current;
      const curTheme = themeRef.current;

      // ── Render Rain & Ripples (Street / Rainy Night) ──
      if (curTheme === "street") {
        ctx.strokeStyle = "rgba(215, 235, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        // Draw and update rain
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const speedMultiplier = isMusicPlaying ? 1.2 : 1.0;
          p.y += p.speed * speedMultiplier;
          p.x += p.slant + mouseOffsetX * 0.02;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(200, 225, 255, ${p.opacity * (isMusicPlaying ? 1.15 : 0.85)})`;
          ctx.lineWidth = p.thickness;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.slant * 2, p.y + p.len);
          ctx.stroke();

          // Spawn splash ripple when hitting near bottom
          if (p.y > height - 100 && Math.random() > 0.88 && ripples.length < 25) {
            ripples.push({
              x: p.x,
              y: p.y + p.len,
              radius: 1,
              maxRadius: Math.random() * 12 + 6,
              opacity: 0.35,
            });
          }

          if (p.y > height + 40 || p.x < -100 || p.x > width + 100) {
            particles[i] = createParticle("street");
          }
        }

        // Draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 0.5;
          r.opacity -= 0.012;

          if (r.opacity <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 2, r.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180, 215, 255, ${r.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // ── Render Golden Leaves (Campus) ──
      else if (curTheme === "campus") {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.oscillation += p.oscSpeed;
          p.x += p.speedX + Math.sin(p.oscillation) * 0.8 + mouseOffsetX * 0.03;
          p.y += p.speedY * (isMusicPlaying ? 1.15 : 1.0);
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.2 : 0.9)})`;

          // Draw graceful petal/leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > height + 20 || p.x < -40 || p.x > width + 40) {
            particles[i] = createParticle("campus");
          }
        }
      }

      // ── Render Stage Fog & Embers (Hip Hop) ──
      else if (curTheme === "hiphop") {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (p.type === "ember") {
            p.y += p.speedY * (isMusicPlaying ? 1.3 : 1.0);
            p.x += p.speedX + (Math.random() - 0.5) * 0.5 + mouseOffsetX * 0.02;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.opacity})`;
            ctx.shadowColor = "rgba(255, 120, 30, 0.8)";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.y < -20 || p.opacity <= 0) {
              particles[i] = createParticle("hiphop");
            }
          } else {
            // Ambient soft smoke
            p.y += p.speedY;
            p.x += p.speedX;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, `${p.color}${p.opacity * (isMusicPlaying ? 1.4 : 0.8)})`);
            grad.addColorStop(1, "transparent");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            if (p.y < -p.size * 2) {
              particles[i] = createParticle("hiphop");
            }
          }
        }
      }

      // ── Render Sun Dust Motes (Classroom) ──
      else {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.pulse += p.pulseSpeed;
          p.y += p.speedY + Math.cos(p.pulse) * 0.2;
          p.x += p.speedX + Math.sin(p.pulse) * 0.3 + mouseOffsetX * 0.015;

          const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4) * (isMusicPlaying ? 1.2 : 0.9);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 200, ${currentOpacity})`;
          ctx.shadowColor = "rgba(240, 200, 120, 0.5)";
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
            particles[i] = createParticle("classroom");
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-5 h-full w-full opacity-90 transition-opacity duration-1000"
    />
  );
}
