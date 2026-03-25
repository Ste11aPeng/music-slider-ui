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

/** Convert 0-100 fader % to dB. 0% = -∞, 75% = 0 dB, 100% = +6 dB */
function pctToDb(pct: number): string {
  if (pct <= 0) return "-∞";
  // Map: 75% → 0dB, 100% → +6dB, using log scale below 75%
  if (pct >= 75) {
    const db = ((pct - 75) / 25) * 6;
    return db > 0 ? `+${db.toFixed(1)}` : db.toFixed(1);
  }
  // Below 75%: log scale from -∞ to 0 dB
  const db = 20 * Math.log10(pct / 75);
  return db.toFixed(1);
}

export default function TrackMixer() {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);

  const updateVolume = (id: string, volume: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, volume } : t))
    );
  };

  const toggleSolo = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, solo: !t.solo } : t))
    );
  };

  return (
    <div className="panel-card">
      {/* Header */}
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

      {/* Tracks */}
      <div className="flex gap-2.5">
        {tracks.map((track) => (
          <div key={track.id} className="flex-1 flex flex-col items-center gap-2.5">
            <div className="mixer-track mixer-track-hover w-full rounded-xl relative overflow-hidden flex flex-col" style={{ aspectRatio: '1 / 3.6' }}>
              <div className="flex-1 relative"
                onPointerDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const update = (clientY: number) => {
                    const y = clientY - rect.top;
                    const pct = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
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
                  <span className="mixer-db-label">{pctToDb(track.volume)} dB</span>
                </div>
                <div
                  className="mixer-thumb absolute left-2 right-2 h-[5px] rounded-full cursor-ns-resize z-10"
                  style={{ bottom: `${track.volume}%` }}
                />
                <div
                  className="mixer-track-fill absolute bottom-0 left-0 right-0"
                  style={{ height: `${track.volume}%` }}
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

            <span className={`panel-label transition-colors ${track.solo ? "text-primary font-medium" : ""}`}>
              {track.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
