import Waveform from "@/components/Waveform";
import TrackMixer from "@/components/TrackMixer";

const Index = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
      {/* Enhanced purple ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,hsl(245_60%_55%/0.15)_0%,hsl(245_60%_55%/0.06)_40%,transparent_70%)]" />
        <div className="absolute top-[30%] left-[60%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(260_50%_50%/0.1)_0%,transparent_60%)]" />
        <div className="absolute bottom-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,hsl(230_60%_50%/0.08)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[520px] flex flex-col gap-3">
        <Waveform />
        <TrackMixer />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-5 z-20">
        <p className="text-[0.6875rem] tracking-wide text-[hsl(0_0%_40%)]">
          Designed by{" "}
          <a
            href="https://ruocanpeng.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(0_0%_55%)] hover:text-[hsl(245_60%_70%)] transition-colors duration-200 underline underline-offset-2 decoration-[hsl(0_0%_25%)] hover:decoration-[hsl(245_60%_50%)]"
          >
            Stella P
          </a>
        </p>
      </footer>
      </div>
  );
};

export default Index;
