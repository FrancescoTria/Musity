import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ThemeToggle from "../components/ThemeToggle";
import { getRandomAppleChartTracks, getArtwork, ItunesTrack } from "../utils/itunes";

export default function HomePage() {
  const [trending, setTrending] = useState<ItunesTrack[]>([]);
  const [exploreLoading, setExploreLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    getRandomAppleChartTracks()
      .then((tracks) => {
        if (cancelled) return;
        setTrending(tracks);
        setExploreLoading(false);
      })
      .catch(() => {
        if (!cancelled) setExploreLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-full hero-gradient flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            ♪
          </div>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
            Sounify
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-16 pt-8">
        <div className="text-center mb-10 max-w-xl">
          <h1
            className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Recensisci la{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              musica
            </span>{" "}
            che ami.
          </h1>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Trova qualsiasi brano, ascolta la preview e condividi la tua opinione con la community.
          </p>
        </div>

        <SearchBar large />

        <p className="mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          Premi Invio o clicca un suggerimento per aprire la pagina del brano
        </p>

        {/* Trending */}
        <section className="mt-16 w-full max-w-3xl">
          <div className="mb-4 px-1">
            <h2 className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>
              ESPLORA
            </h2>
            {exploreLoading ? (
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Caricamento brani...</p>
            ) : (
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                9 brani casuali dalle Top 100 Apple Music internazionali
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {exploreLoading
              ? Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="aspect-square rounded-2xl animate-pulse" style={{ background: "var(--secondary)" }} />
              ))
              : trending.length > 0 ? trending.map((track) => (
                <button
                  key={track.trackId}
                  onClick={() => navigate(`/track/${track.trackId}`, { state: { track } })}
                  className="group relative rounded-2xl overflow-hidden aspect-square text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <img
                    src={getArtwork(track.artworkUrl100, 400)}
                    alt={track.trackName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm leading-tight truncate">
                      {track.trackName}
                    </p>
                    <p className="text-white/70 text-xs truncate mt-0.5">{track.artistName}</p>
                  </div>
                </button>
              )) : (
                <p className="col-span-full py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Nessun brano disponibile al momento.
                </p>
              )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs" style={{ color: "var(--muted-foreground)" }}>
        Powered by iTunes Search API · Metadati &amp; preview forniti da Apple
      </footer>
    </div>
  );
}
