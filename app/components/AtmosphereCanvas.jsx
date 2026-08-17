"use client";

import { useEffect, useRef } from "react";

export default function AtmosphereCanvas({ theme, isPlaying, isExhausted }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const themeRef = useRef(theme);
  const playingRef = useRef(isPlaying);
  const exhaustedRef = useRef(isExhausted);

  themeRef.current = theme;
  playingRef.current = isPlaying;
  exhaustedRef.current = isExhausted;

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
      initSystems();
    };

    window.addEventListener("resize", handleResize);

    // Dynamic Systems
    let particles = [];
    let clouds = [];
    let ripples = [];
    let sunbeams = [];
    let time = 0;

    function initSystems() {
      const currentTheme = themeRef.current;
      const isEx = exhaustedRef.current && currentTheme === "campus";
      particles = [];
      clouds = [];

      // 1. Clouds / Mist system
      const cloudCount = isEx ? 5 : currentTheme === "street" ? 6 : currentTheme === "campus" ? 4 : 3;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * (width + 600) - 300,
          y: Math.random() * (height * 0.4) - 40,
          width: Math.random() * 450 + 320,
          height: Math.random() * 160 + 100,
          speed: Math.random() * 0.35 + 0.15,
          opacity: isEx ? Math.random() * 0.15 + 0.08 : Math.random() * 0.12 + 0.06,
          scale: Math.random() * 0.4 + 0.8,
          wobbleSpeed: Math.random() * 0.01 + 0.005,
          wobbleOffset: Math.random() * Math.PI * 2,
        });
      }

      // 2. Particles
      const count =
        isEx
          ? 50
          : currentTheme === "street"
          ? 140
          : currentTheme === "campus"
          ? 40
          : currentTheme === "hiphop"
          ? 45
          : 30;

      for (let i = 0; i < count; i++) {
        particles.push(createParticle(currentTheme, isEx, true));
      }
    }

    function createParticle(t, isEx, initialRandomY = false) {
      const startY = initialRandomY ? Math.random() * height : -20;

      // ── Exhausted Knight (Luminous Teal Water Ripples & Embers) ──
      if (isEx) {
        const isEmber = Math.random() > 0.55;
        if (isEmber) {
          return {
            type: "ember",
            x: Math.random() * width,
            y: initialRandomY ? Math.random() * height : height + 20,
            size: Math.random() * 2.5 + 1.2,
            speedY: -(Math.random() * 1.4 + 0.6),
            speedX: (Math.random() - 0.5) * 0.6,
            opacity: Math.random() * 0.75 + 0.3,
            color: Math.random() > 0.5 ? "rgba(80, 230, 210," : "rgba(235, 180, 80,",
          };
        } else {
          return {
            type: "water-mote",
            x: Math.random() * width,
            y: startY,
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 0.6 + 0.3,
            speedX: (Math.random() - 0.5) * 0.8,
            opacity: Math.random() * 0.6 + 0.25,
            color: "rgba(64, 224, 208,",
          };
        }
      }

      // ── Rainy Night (Enchanted Ghibli Woods + Rain + Spirit Orbs) ──
      if (t === "street") {
        const rand = Math.random();
        if (rand < 0.82) {
          // Crisp anime rain streak
          return {
            type: "rain",
            x: Math.random() * (width + 200) - 100,
            y: startY,
            len: Math.random() * 28 + 18,
            speed: Math.random() * 14 + 16,
            thickness: Math.random() * 1.3 + 0.7,
            opacity: Math.random() * 0.45 + 0.22,
            slant: -3.4,
          };
        } else {
          // Streetlight glowing rain shimmer / mist droplet
          return {
            type: "mist-shimmer",
            x: Math.random() * width,
            y: startY,
            size: Math.random() * 2.5 + 1.2,
            speedY: Math.random() * 0.8 + 0.4,
            speedX: (Math.random() - 0.5) * 0.7,
            opacity: Math.random() * 0.5 + 0.2,
            color: Math.random() > 0.5 ? "rgba(180, 225, 255," : "rgba(255, 240, 200,",
          };
        }
      }

      // ── Campus (Golden Hour Leaves) ──
      else if (t === "campus") {
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
      }

      // ── Hip Hop (Stage Embers & Smoke) ──
      else if (t === "hiphop") {
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
      }

      // ── Classroom (Sun Dust Motes) ──
      else {
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

    initSystems();

    let lastTheme = themeRef.current;

    // Main 60fps render loop
    function render() {
      time += 0.02;

      // Re-init systems if theme switched
      if (lastTheme !== themeRef.current) {
        lastTheme = themeRef.current;
        initSystems();
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseX = mouseRef.current.x * width;
      const mouseY = mouseRef.current.y * height;
      const mouseOffsetX = (mouseRef.current.x - 0.5) * 30;
      const mouseOffsetY = (mouseRef.current.y - 0.5) * 20;
      const isMusicPlaying = playingRef.current;
      const curTheme = themeRef.current;

      // ─────────────────────────────────────────────────────────────
      // 1. Volumetric Anime Cloud Flow & Night Mist
      // ─────────────────────────────────────────────────────────────
      if (curTheme === "street" || curTheme === "campus") {
        for (let i = 0; i < clouds.length; i++) {
          const cloud = clouds[i];
          cloud.x += cloud.speed * (isMusicPlaying ? 1.25 : 1.0);
          const wobble = Math.sin(time + cloud.wobbleOffset) * 8;

          if (cloud.x - cloud.width > width) {
            cloud.x = -cloud.width - 50;
            cloud.y = Math.random() * (height * 0.45) - 40;
          }

          ctx.save();
          const cloudGrad = ctx.createRadialGradient(
            cloud.x + cloud.width * 0.5,
            cloud.y + wobble + cloud.height * 0.5,
            10,
            cloud.x + cloud.width * 0.5,
            cloud.y + wobble + cloud.height * 0.5,
            cloud.width * 0.5
          );

          const cloudTint =
            curTheme === "street"
              ? "170, 210, 245"
              : "255, 235, 210";

          cloudGrad.addColorStop(0, `rgba(${cloudTint}, ${cloud.opacity * (isMusicPlaying ? 1.2 : 1.0)})`);
          cloudGrad.addColorStop(0.5, `rgba(${cloudTint}, ${cloud.opacity * 0.4})`);
          cloudGrad.addColorStop(1, "transparent");

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.ellipse(
            cloud.x + cloud.width * 0.5,
            cloud.y + wobble + cloud.height * 0.5,
            cloud.width * 0.5,
            cloud.height * 0.5,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 3. Particles & Flora
      // ─────────────────────────────────────────────────────────────

      // ── STREET (ENCHANTED GHIBLI RAINY NIGHT) ──
      if (curTheme === "street") {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // A) Rain streaks
          if (p.type === "rain") {
            const speedMultiplier = isMusicPlaying ? 1.2 : 1.0;
            p.y += p.speed * speedMultiplier;
            p.x += p.slant + mouseOffsetX * 0.02;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(195, 230, 255, ${p.opacity * (isMusicPlaying ? 1.15 : 0.85)})`;
            ctx.lineWidth = p.thickness;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.slant * 2, p.y + p.len);
            ctx.stroke();

            // Splash ripples
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

          // B) Streetlight rain mist / light shimmer
          else {
            p.y += p.speedY * (isMusicPlaying ? 1.2 : 1.0);
            p.x += p.speedX + mouseOffsetX * 0.015;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.2 : 0.85)})`;
            ctx.shadowColor = "rgba(180, 220, 255, 0.6)";
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
              particles[i] = createParticle("street");
            }
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
          ctx.strokeStyle = `rgba(180, 225, 255, ${r.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // ── CAMPUS (GOLDEN LEAVES OR EXHAUSTED WATER MOTES & EMBERS) ──
      else if (curTheme === "campus") {
        const isEx = exhaustedRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (isEx) {
            if (p.type === "ember") {
              p.y += p.speedY * (isMusicPlaying ? 1.3 : 1.0);
              p.x += p.speedX + mouseOffsetX * 0.02;

              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.2 : 0.85)})`;
              ctx.shadowColor = "rgba(80, 230, 210, 0.7)";
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;

              if (p.y < -20 || p.x < -20 || p.x > width + 20) {
                particles[i] = createParticle("campus", true);
              }
            } else {
              p.y += p.speedY * (isMusicPlaying ? 1.2 : 1.0);
              p.x += p.speedX + mouseOffsetX * 0.02;

              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.3 : 0.8)})`;
              ctx.shadowColor = "rgba(64, 224, 208, 0.8)";
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;

              if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
                particles[i] = createParticle("campus", true);
              }
            }
          } else {
            p.oscillation += p.oscSpeed;
            p.x += p.speedX + Math.sin(p.oscillation) * 0.8 + mouseOffsetX * 0.03;
            p.y += p.speedY * (isMusicPlaying ? 1.15 : 1.0);
            p.rotation += p.rotSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.2 : 0.9)})`;

            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (p.y > height + 20 || p.x < -40 || p.x > width + 40) {
              particles[i] = createParticle("campus", false);
            }
          }
        }
      }

      // ── HIP HOP (EMBERS & STAGE SMOKE) ──
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

      // ── CLASSROOM (SUN DUST MOTES) ──
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
