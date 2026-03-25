import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

type PlayState = "recording" | "paused" | "stopped";

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [playState, setPlayState] = useState<PlayState>("recording");
  const [elapsed, setElapsed] = useState(0);
  const [iconKey, setIconKey] = useState(0);

  useEffect(() => {
    const count = 300;
    barsRef.current = Array.from({ length: count }, () => 0.1 + Math.random() * 0.9);
  }, []);

  useEffect(() => {
    if (playState !== "recording") return;
    const start = Date.now() - elapsed * 1000;
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [playState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    lastTimeRef.current = performance.now();

    const draw = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (playState === "recording") {
        offsetRef.current += dt * 0.04;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const bars = barsRef.current;
      const totalBars = bars.length;
      const gap = 2.5;
      const barW = 3;
      const step = barW + gap;
      const maxH = h * 0.75;
      const centerY = h / 2;
      const offset = offsetRef.current;
      const playX = w * 0.5;

      // Gradient transition zone width (px)
      const transitionZone = 40;

      const startIdx = Math.floor(offset / step);
      const xShift = -(offset % step);

      for (let i = 0; ; i++) {
        const x = xShift + i * step;
        if (x > w) break;
        const barIdx = (startIdx + i) % totalBars;
        const amp = bars[barIdx];
        const barH = amp * maxH;
        const halfH = barH / 2;

        // Smooth color transition near playhead
        const barCenter = x + barW / 2;
        const dist = barCenter - playX;
        if (dist < -transitionZone) {
          // Fully past
          ctx.fillStyle = "hsl(0, 0%, 65%)";
        } else if (dist > transitionZone) {
          // Fully future
          ctx.fillStyle = "hsl(0, 0%, 30%)";
        } else {
          // Transition zone: interpolate lightness 30% <-> 65%
          const t = (dist + transitionZone) / (2 * transitionZone); // 0 (past) -> 1 (future)
          const lightness = 65 - t * 35;
          ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
        }

        const r = Math.min(barW / 2, 1.5);
        roundRect(ctx, x, centerY - halfH, barW, barH, r);
      }

      // Playhead line
      ctx.fillStyle = "hsl(245, 60%, 55%)";
      ctx.fillRect(playX - 1, 6, 2, h - 12);

      // Playhead dot with breathing glow
      if (playState === "recording") {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(now * 0.003));
        const glowRadius = 12 + pulse * 6;
        const gradient = ctx.createRadialGradient(playX, centerY, 2, playX, centerY, glowRadius);
        gradient.addColorStop(0, `hsla(245, 70%, 60%, ${0.6 * pulse})`);
        gradient.addColorStop(1, "hsla(245, 70%, 60%, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(playX - glowRadius, centerY - glowRadius, glowRadius * 2, glowRadius * 2);
      }

      ctx.fillStyle = "hsl(245, 60%, 55%)";
      ctx.beginPath();
      ctx.arc(playX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [playState]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = Math.floor(s % 60).toString().padStart(2, "0");
    const ms = Math.floor((s % 1) * 100).toString().padStart(2, "0");
    return `${mins}:${secs}:${ms}`;
  };

  const handleToggle = () => {
    setIconKey((k) => k + 1);
    setPlayState((prev) => {
      if (prev === "recording") return "paused";
      if (prev === "paused") return "recording";
      return "recording";
    });
  };

  return (
    <div className="panel-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="panel-title">New Audio</div>
          <div className="panel-subtitle mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      <canvas ref={canvasRef} className="w-full" style={{ height: 80 }} />

      <div className="flex items-center justify-between mt-3">
        <span className="waveform-time">{formatTime(elapsed)}</span>
        <button
          onClick={handleToggle}
          className="waveform-stop-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all"
        >
          <span key={iconKey} className="waveform-icon-anim inline-flex">
            {playState === "recording" ? (
              <Pause size={15} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" className="ml-0.5" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
