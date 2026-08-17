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
      particles = [];
      clouds = [];
      sunbeams = [];

      // 1. Clouds system (Ghibli & Nature themes)
      const cloudCount = currentTheme === "ghibli" ? 8 : 4;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * (width + 600) - 300,
          y: Math.random() * (height * 0.45) - 40,
          width: Math.random() * 450 + 320,
          height: Math.random() * 160 + 100,
          speed: Math.random() * 0.4 + 0.2,
          opacity: Math.random() * 0.16 + 0.08,
          scale: Math.random() * 0.4 + 0.8,
          wobbleSpeed: Math.random() * 0.01 + 0.005,
          wobbleOffset: Math.random() * Math.PI * 2,
        });
      }

      // 2. God Rays / Sunbeams (Komorebi)
      const rayCount = currentTheme === "ghibli" ? 5 : currentTheme === "campus" ? 4 : 2;
      for (let i = 0; i < rayCount; i++) {
        sunbeams.push({
          x: (width * 0.4) + (i - rayCount / 2) * (width * 0.18),
          topWidth: Math.random() * 40 + 20,
          bottomWidth: Math.random() * 220 + 140,
          angle: -0.22 + (i * 0.08),
          baseOpacity: Math.random() * 0.12 + 0.08,
          pulseSpeed: Math.random() * 0.015 + 0.008,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // 3. Particles
      const count =
        currentTheme === "ghibli"
          ? 65
          : currentTheme === "street"
          ? 140
          : currentTheme === "campus"
          ? 45
          : currentTheme === "hiphop"
          ? 50
          : 35;

      for (let i = 0; i < count; i++) {
        particles.push(createParticle(currentTheme, true));
      }
    }

    function createParticle(t, initialRandomY = false) {
      const startY = initialRandomY ? Math.random() * height : -20;

      // ── Ghibli Enchanted Forest (Spirit Orbs, Petals & Spores) ──
      if (t === "ghibli") {
        const rand = Math.random();
        if (rand < 0.45) {
          // Kodama Forest Spirit Firefly / Glowing Orb
          return {
            type: "spirit",
            x: Math.random() * width,
            y: initialRandomY ? Math.random() * height : height + 20,
            size: Math.random() * 3.5 + 1.8,
            speedY: -(Math.random() * 0.8 + 0.4),
            speedX: (Math.random() - 0.5) * 0.7,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.03 + 0.015,
            opacity: Math.random() * 0.7 + 0.3,
            color: Math.random() > 0.35 ? "rgba(180, 245, 255," : "rgba(220, 255, 200,",
            glowRadius: Math.random() * 16 + 10,
          };
        } else if (rand < 0.8) {
          // Wildflower Petal (Hydrangea Blue & Wildflower Pink)
          const isPink = Math.random() > 0.5;
          return {
            type: "ghibli-petal",
            x: Math.random() * width,
            y: startY,
            size: Math.random() * 6 + 3.5,
            speedY: Math.random() * 1.1 + 0.6,
            speedX: Math.random() * 1.6 - 0.8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            oscillation: Math.random() * 100,
            oscSpeed: Math.random() * 0.02 + 0.01,
            color: isPink ? "rgba(244, 114, 182," : "rgba(96, 165, 250,",
            opacity: Math.random() * 0.55 + 0.35,
          };
        } else {
          // Dandelion Spore / Golden Light Mote
          return {
            type: "spore",
            x: Math.random() * width,
            y: startY,
            size: Math.random() * 2 + 1,
            speedY: Math.random() * 0.6 + 0.3,
            speedX: (Math.random() - 0.5) * 0.9,
            opacity: Math.random() * 0.6 + 0.25,
            color: "rgba(255, 255, 220,",
          };
        }
      }

      // ── Street (Rainy Night) ──
      else if (t === "street") {
        return {
          type: "rain",
          x: Math.random() * (width + 200) - 100,
          y: startY,
          len: Math.random() * 28 + 16,
          speed: Math.random() * 14 + 16,
          thickness: Math.random() * 1.2 + 0.6,
          opacity: Math.random() * 0.45 + 0.15,
          slant: -3.5,
        };
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
      // 1. Volumetric God Rays / Sunbeams (Komorebi Light Shafts)
      // ─────────────────────────────────────────────────────────────
      if (curTheme === "ghibli" || curTheme === "campus") {
        for (let i = 0; i < sunbeams.length; i++) {
          const ray = sunbeams[i];
          const pulse = Math.sin(time * ray.pulseSpeed * 60 + ray.pulsePhase);
          const currentOpacity = ray.baseOpacity * (1 + pulse * 0.35) * (isMusicPlaying ? 1.3 : 1.0);

          ctx.save();
          const grad = ctx.createLinearGradient(ray.x, 0, ray.x + ray.angle * height, height);
          const rayColor = curTheme === "ghibli" ? "180, 240, 255" : "255, 230, 160";

          grad.addColorStop(0, `rgba(${rayColor}, ${currentOpacity * 1.5})`);
          grad.addColorStop(0.4, `rgba(${rayColor}, ${currentOpacity * 0.8})`);
          grad.addColorStop(1, "transparent");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(ray.x - ray.topWidth / 2, 0);
          ctx.lineTo(ray.x + ray.topWidth / 2, 0);
          ctx.lineTo(ray.x + ray.angle * height + ray.bottomWidth / 2, height);
          ctx.lineTo(ray.x + ray.angle * height - ray.bottomWidth / 2, height);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 2. Volumetric Anime Cloud Flow & Mist
      // ─────────────────────────────────────────────────────────────
      if (curTheme === "ghibli" || curTheme === "campus" || curTheme === "street") {
        for (let i = 0; i < clouds.length; i++) {
          const cloud = clouds[i];
          cloud.x += cloud.speed * (isMusicPlaying ? 1.25 : 1.0);
          const wobble = Math.sin(time + cloud.wobbleOffset) * 8;

          // Wrap cloud around screen
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
            curTheme === "ghibli"
              ? "210, 240, 255"
              : curTheme === "street"
              ? "160, 185, 220"
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
      // 3. Particles & Living Flora Animation
      // ─────────────────────────────────────────────────────────────

      // ── GHIBLI FOREST PARTICLES ──
      if (curTheme === "ghibli") {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // A) Kodama / Forest Spirit Orbs
          if (p.type === "spirit") {
            p.wobble += p.wobbleSpeed;
            p.y += p.speedY * (isMusicPlaying ? 1.2 : 1.0);
            p.x += p.speedX + Math.sin(p.wobble) * 0.8 + mouseOffsetX * 0.02;

            // Interactive attraction to cursor when nearby
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180 && dist > 10) {
              p.x += (dx / dist) * 0.8;
              p.y += (dy / dist) * 0.8;
            }

            const pulse = 0.7 + Math.sin(p.wobble * 2) * 0.3;
            const opacity = p.opacity * pulse * (isMusicPlaying ? 1.3 : 1.0);

            // Spirit Outer Halo Glow
            const spiritGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
            spiritGrad.addColorStop(0, `${p.color}${opacity})`);
            spiritGrad.addColorStop(0.4, `${p.color}${opacity * 0.5})`);
            spiritGrad.addColorStop(1, "transparent");

            ctx.fillStyle = spiritGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Spirit Bright Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
            ctx.shadowColor = "rgba(160, 240, 255, 0.9)";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.y < -30 || p.x < -30 || p.x > width + 30) {
              particles[i] = createParticle("ghibli");
            }
          }

          // B) Wildflower Petals (Blue & Pink)
          else if (p.type === "ghibli-petal") {
            p.oscillation += p.oscSpeed;
            p.x += p.speedX + Math.sin(p.oscillation) * 1.1 + mouseOffsetX * 0.025;
            p.y += p.speedY * (isMusicPlaying ? 1.15 : 1.0);
            p.rotation += p.rotSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.2 : 0.9)})`;
            ctx.shadowColor = p.color + "0.4)";
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (p.y > height + 20 || p.x < -40 || p.x > width + 40) {
              particles[i] = createParticle("ghibli");
            }
          }

          // C) Spores / Light motes
          else {
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(time + i) * 0.4;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.opacity * (isMusicPlaying ? 1.2 : 0.8)})`;
            ctx.shadowColor = "rgba(255, 255, 200, 0.6)";
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
              particles[i] = createParticle("ghibli");
            }
          }
        }
      }

      // ── STREET (RAIN & RIPPLES) ──
      else if (curTheme === "street") {
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

      // ── CAMPUS (GOLDEN LEAVES) ──
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

          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > height + 20 || p.x < -40 || p.x > width + 40) {
            particles[i] = createParticle("campus");
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
