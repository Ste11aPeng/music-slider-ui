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
              {/* Fader Channel */}
              <div className="mixer-track w-full aspect-[1/2.8] rounded-xl relative overflow-hidden">
                {/* Volume fill */}
                <div
                  className="mixer-track-fill absolute bottom-0 left-0 right-0 rounded-b-xl transition-all duration-150"
                  style={{ height: `${track.volume}%` }}
                />
                {/* Thumb */}
                <div
                  className="mixer-thumb absolute left-2 right-2 h-[6px] rounded-full transition-all duration-150 cursor-ns-resize"
                  style={{ bottom: `calc(${track.volume}% - 3px)` }}
                  onPointerDown={(e) => {
                    const el = e.currentTarget.parentElement!;
                    const rect = el.getBoundingClientRect();
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
              </div>

              {/* Solo button */}
              <button
                onClick={() => toggleSolo(track.id)}
                className={`mixer-solo-btn w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  track.solo ? "mixer-solo-active" : ""
                }`}
              >
                S
              </button>

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
