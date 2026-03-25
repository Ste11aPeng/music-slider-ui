import Waveform from "@/components/Waveform";
import TrackMixer from "@/components/TrackMixer";

const Index = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-[520px] flex flex-col gap-3">
        <Waveform />
        <TrackMixer />
      </div>
    </div>
  );
};

export default Index;
