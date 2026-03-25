import { useState } from "react";
import { Plus } from "lucide-react";

interface Track {
  id: string;
  name: string;
  volume: number;
  solo: boolean;
}

const initialTracks: Track[] = [
  { id: "1", name: "Vocal", volume: 75, solo: false },
  { id: "2", name: "Drums", volume: 65, solo: false },
  { id: "3", name: "Guitar", volume: 85, solo: false },
  { id: "4", name: "Keys", volume: 40, solo: false },
  { id: "5", name: "Bass", volume: 70, solo: false },
];

function pctToDb(pct: number): number {
  if (pct <= 0) return -Infinity;
  if (pct >= 75) return ((pct - 75) / 25) * 6;
  return 20 * Math.log10(pct / 75);
}

function formatDb(pct: number): string {
  const db = pctToDb(pct);
  if (!isFinite(db)) return "-∞";
  return db > 0 ? `+${db.toFixed(1)}` : db.toFixed(1);
}

function dbToPct(db: number): number {
  if (!isFinite(db)) return 0;
  if (db >= 0) return 75 + (db / 6) * 25;
  return 75 * Math.pow(10, db / 20);
}

const SNAP_DB_VALUES = [6, 0, -6, -18];
const SNAP_POINTS = SNAP_DB_VALUES.map((db) => ({
  db,
  pct: dbToPct(db),
}));

const SNAP_THRESHOLD = 2.5;

function snapVolume(rawPct: number): number {
  for (const sp of SNAP_POINTS) {
    if (Math.abs(rawPct - sp.pct) < SNAP_THRESHOLD) {
      return sp.pct;
    }
  }
  return rawPct;
}

export default function TrackMixer() {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);

  const updateVolume = (id: string, volume: number) => {
    const snapped = snapVolume(volume);
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, volume: snapped } : t))
    );
  };

  const toggleSolo = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, solo: !t.solo } : t))
    );
  };

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-2">
          <span className="panel-title">Tracks</span>
          <span className="panel-subtitle">
            {tracks.length}/{tracks.length}
          </span>
        </div>
        <button className="panel-action-btn flex items-center gap-1 px-3 py-1.5 rounded-lg">
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      <div className="flex gap-2.5">
        {tracks.map((track, index) => {
          const isSnapped = SNAP_POINTS.some(
            (sp) => Math.abs(track.volume - sp.pct) < 0.1
          );
          return (
            <div
              key={track.id}
              className="flex-1 flex flex-col items-center gap-2.5 track-entrance"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className="mixer-track mixer-track-hover w-full rounded-xl relative overflow-hidden flex flex-col"
                style={{ aspectRatio: "1 / 3.6" }}
              >
                <div
                  className="flex-1 relative"
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const update = (clientY: number) => {
                      const y = clientY - rect.top;
                      const pct = Math.max(
                        0,
                        Math.min(100, 100 - (y / rect.height) * 100)
                      );
                      updateVolume(track.id, pct);
                    };
                    update(e.clientY);
                    const move = (ev: PointerEvent) => update(ev.clientY);
                    const up = () => {
                      window.removeEventListener("pointermove", move);
                      window.removeEventListener("pointerup", up);
                    };
                    window.addEventListener("pointermove", move);
                    window.addEventListener("pointerup", up);
                    e.preventDefault();
                  }}
                >
                  {/* dB value */}
                  <div className="absolute top-2 left-0 right-0 z-20 flex justify-center">
                    <span className="mixer-db-label">
                      {formatDb(track.volume)} dB
                    </span>
                  </div>

                  {/* Snap point dots */}
                  {SNAP_POINTS.filter((sp) => sp.pct > track.volume).map((sp) => (
                    <div
                      key={sp.db}
                      className="absolute left-0 right-0 flex items-center justify-center z-[5] pointer-events-none"
                      style={{ bottom: `${sp.pct}%` }}
                    >
                      <div
                        className={`snap-dot ${
                          Math.abs(track.volume - sp.pct) < 0.1
                            ? "snap-dot-active"
                            : ""
                        }`}
                      />
                    </div>
                  ))}

                  {/* Thumb with spring on snap */}
                  <div
                    className="mixer-thumb absolute left-2 right-2 h-[5px] rounded-full cursor-ns-resize z-10"
                    style={{
                      bottom: `${track.volume}%`,
                      transition: isSnapped
                        ? "bottom 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        : "none",
                    }}
                  />
                  <div
                    className="mixer-track-fill absolute bottom-0 left-0 right-0"
                    style={{
                      height: `${track.volume}%`,
                      transition: isSnapped
                        ? "height 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        : "none",
                    }}
                  />
                </div>

                <div className="px-1.5 pb-1.5 pt-2.5 relative z-10">
                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`mixer-solo-btn w-full py-2.5 rounded-[0.55rem] text-xs font-semibold flex items-center justify-center transition-all ${
                      track.solo ? "mixer-solo-active" : ""
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>

              <span
                className={`panel-label transition-colors ${
                  track.solo ? "text-primary font-medium" : ""
                }`}
              >
                {track.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
