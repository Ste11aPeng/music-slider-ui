import { useState } from "react";
import { Plus } from "lucide-react";

interface Track {
  id: string;
  name: string;
  volume: number;
  solo: boolean;
  active: boolean;
}

const initialTracks: Track[] = [
  { id: "1", name: "人声", volume: 75, solo: false, active: true },
  { id: "2", name: "鼓", volume: 65, solo: false, active: true },
  { id: "3", name: "吉他", volume: 85, solo: false, active: true },
  { id: "4", name: "键盘", volume: 40, solo: false, active: true },
  { id: "5", name: "贝斯", volume: 70, solo: false, active: true },
];

type TabType = "调节" | "分轨" | "备注";

export default function TrackMixer() {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [activeTab, setActiveTab] = useState<TabType>("分轨");

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

  const tabs: TabType[] = ["调节", "分轨", "备注"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="mixer-container w-full max-w-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground font-bold text-lg">分轨</span>
            <span className="text-muted-foreground text-sm">
              {tracks.length}/{tracks.length}
            </span>
          </div>
          <button className="mixer-add-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground">
            <Plus size={16} />
            <span>添加</span>
          </button>
        </div>

        {/* Tracks */}
        <div className="flex gap-2.5 mb-6">
          {tracks.map((track) => (
            <div key={track.id} className="flex-1 flex flex-col items-center gap-2.5">
              {/* Fader Channel - contains track + solo inside one card */}
              <div className="mixer-track w-full rounded-xl relative overflow-hidden flex flex-col" style={{ aspectRatio: '1 / 3.6' }}>
                {/* Upper empty zone (unfilled) */}
                <div className="flex-1 relative">
                  {/* Thumb bar */}
                  <div
                    className="mixer-thumb absolute left-2 right-2 h-[5px] rounded-full transition-all duration-150 cursor-ns-resize z-10"
                    style={{ bottom: `${track.volume}%` }}
                    onPointerDown={(e) => {
                      const container = e.currentTarget.parentElement!;
                      const rect = container.getBoundingClientRect();
                      const move = (ev: PointerEvent) => {
                        const y = ev.clientY - rect.top;
                        const pct = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
                        updateVolume(track.id, Math.round(pct));
                      };
                      const up = () => {
                        window.removeEventListener("pointermove", move);
                        window.removeEventListener("pointerup", up);
                      };
                      window.addEventListener("pointermove", move);
                      window.addEventListener("pointerup", up);
                      e.preventDefault();
                    }}
                  />
                  {/* Volume fill from bottom */}
                  <div
                    className="mixer-track-fill absolute bottom-0 left-0 right-0 transition-all duration-150"
                    style={{ height: `${track.volume}%` }}
                  />
                </div>

                {/* Solo button inside the card at bottom */}
                <div className="flex items-center justify-center py-3 relative z-10">
                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`mixer-solo-btn w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      track.solo ? "mixer-solo-active" : ""
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Track name */}
              <span className="text-muted-foreground text-sm">{track.name}</span>

              {/* Active dot */}
              <div className="mixer-dot w-2 h-2 rounded-full" />
            </div>
          ))}
        </div>

        {/* Bottom tabs */}
        <div className="mixer-tabs flex rounded-xl overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "mixer-tab-active text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
