import { useEffect, useRef, useState } from "react";
import { Square } from "lucide-react";

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const playheadRef = useRef(0.45); // 0-1 position

  // Generate initial bars
  useEffect(() => {
    const count = 80;
    barsRef.current = Array.from({ length: count }, (_, i) => {
      const center = count * 0.45;
      const dist = Math.abs(i - center) / (count * 0.5);
      const base = Math.max(0.08, 1 - dist * dist);
      return base * (0.4 + Math.random() * 0.6);
    });
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const start = Date.now() - elapsed * 1000;
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const bars = barsRef.current;
      const count = bars.length;
      const gap = 2;
      const barW = (w - gap * (count - 1)) / count;
      const maxH = h * 0.7;
      const centerY = h / 2;
      const playX = playheadRef.current * w;

      // Draw bars
      bars.forEach((amp, i) => {
        const x = i * (barW + gap);
        // Animate slightly
        const wave = isPlaying
          ? Math.sin(Date.now() * 0.003 + i * 0.3) * 0.08
          : 0;
        const barH = (amp + wave) * maxH;
        const halfH = barH / 2;

        const isPast = x + barW < playX;
        const isFuture = x > playX;

        if (isPast) {
          ctx.fillStyle = "hsl(0, 0%, 75%)";
        } else if (isFuture) {
          ctx.fillStyle = "hsl(0, 0%, 30%)";
        } else {
          ctx.fillStyle = "hsl(0, 0%, 75%)";
        }

        // Rounded mini bars
        const r = Math.min(barW / 2, 1.5);
        roundRect(ctx, x, centerY - halfH, barW, barH, r);
      });

      // Playhead line
      ctx.fillStyle = "hsl(40, 90%, 55%)";
      ctx.fillRect(playX - 1, 8, 2, h - 16);

      // Playhead dot
      ctx.beginPath();
      ctx.arc(playX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Dashed future line
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "hsl(0, 0%, 25%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(playX + 8, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = Math.floor(s % 60).toString().padStart(2, "0");
    const ms = Math.floor((s % 1) * 100).toString().padStart(2, "0");
    return `${mins}:${secs}:${ms}`;
  };

  return (
    <div className="waveform-container mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-foreground text-sm font-medium">New Audio</div>
          <div className="text-muted-foreground text-xs">
            {new Date().toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 80 }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="waveform-time text-2xl font-mono font-light tracking-wide">
          {formatTime(elapsed)}
        </span>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="waveform-stop-btn w-10 h-10 rounded-lg flex items-center justify-center transition-all"
        >
          <Square size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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
