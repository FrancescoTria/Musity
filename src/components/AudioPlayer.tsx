import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  previewUrl: string;
  artworkUrl: string;
  trackName: string;
  artistName: string;
}

export default function AudioPlayer({ previewUrl, artworkUrl, trackName, artistName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 30)) * 100);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 30);
  };

  const fmt = (t: number) => {
    const s = Math.floor(t);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: "var(--secondary)" }}
    >
      <audio ref={audioRef} src={previewUrl} preload="auto" autoPlay />

      <img
        src={artworkUrl}
        alt={trackName}
        className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-lg"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
          {trackName}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
          {artistName} · Preview 30s
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="3.5" height="10" rx="1" />
                <rect x="7.5" y="1" width="3.5" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
              </svg>
            )}
          </button>

          <div
            className="flex-1 h-1.5 rounded-full cursor-pointer relative overflow-hidden"
            style={{ background: "var(--border)" }}
            onClick={seek}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, background: "var(--primary)" }}
            />
          </div>

          <span className="text-xs tabular-nums shrink-0" style={{ color: "var(--muted-foreground)" }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          {playing && (
            <div className="flex items-end gap-0.5 shrink-0 h-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bar-animate"
                  style={{
                    height: "100%",
                    background: "var(--primary)",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
