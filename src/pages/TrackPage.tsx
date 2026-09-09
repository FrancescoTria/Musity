import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ItunesTrack, lookupTrack, getArtwork, formatDuration, formatReleaseYear } from "../utils/itunes";
import { Review, getReviews, getAverageRating, getSteamLabel } from "../utils/ratings";
import AudioPlayer from "../components/AudioPlayer";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import RatingBadge from "../components/RatingBadge";
import SearchBar from "../components/SearchBar";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";
import { useTheme } from "../context/ThemeContext";

type SortKey = "recent" | "top" | "lowest";

export default function TrackPage() {
  const { theme } = useTheme();
  const { trackId } = useParams<{ trackId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [track, setTrack] = useState<ItunesTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState<SortKey>("recent");
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trackFromNavigation = location.state?.track as ItunesTrack | undefined;

    setImgLoaded(false);

    if (trackFromNavigation && String(trackFromNavigation.trackId) === trackId) {
      setTrack(trackFromNavigation);
      setLoading(false);
      return () => { cancelled = true; };
    }

    if (!trackId) {
      setTrack(null);
      setLoading(false);
      return () => { cancelled = true; };
    }

    setTrack(null);
    setLoading(true);
    lookupTrack(Number(trackId)).then((nextTrack) => {
      if (cancelled) return;
      setTrack(nextTrack);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [trackId, location.state]);

  const refreshReviews = () => {
    if (trackId) setReviews(getReviews(Number(trackId)));
  };

  useEffect(() => { refreshReviews(); }, [trackId]);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "top") return b.rating - a.rating;
    if (sort === "lowest") return a.rating - b.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const avg = getAverageRating(reviews);
  const label = getSteamLabel(avg, reviews.length);
  const artwork = track ? getArtwork(track.artworkUrl100, 600) : "";
  const artworkThumb = track ? getArtwork(track.artworkUrl100, 100) : "";
  const heroNavColor = theme === "dark" ? "#ffffff" : "#111118";

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl animate-pulse"
            style={{ background: "var(--secondary)" }}
          />
          <p style={{ color: "var(--muted-foreground)" }}>Caricamento brano...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>Brano non trovato</p>
          <Link to="/" className="text-sm" style={{ color: "var(--primary)" }}>← Torna alla home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ background: "var(--background)" }}>
      {/* Blurred hero banner */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={getArtwork(track.artworkUrl100, 1200)}
          alt=""
          aria-hidden
          className="w-full h-full object-cover scale-110"
          style={{ filter: "blur(40px) brightness(0.5) saturate(1.4)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[var(--background)]" />

        {/* Nav overlay */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: heroNavColor }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Indietro
            </button>
            <Link to="/" className="transition-colors" style={{ color: heroNavColor }}>
              <BrandLogo size="sm" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-72 lg:w-96 hidden md:block">
              <SearchBar />
            </div>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 -mt-28 relative pb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left column */}
          <div className="md:w-72 shrink-0 flex flex-col gap-4">
            {/* Artwork */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square" style={{ background: "var(--secondary)" }}>
              <img
                src={artwork}
                alt={`${track.trackName} cover`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
              />
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse" style={{ background: "var(--secondary)" }} />
              )}
            </div>

            {/* Preview player */}
            {track.previewUrl ? (
              <AudioPlayer
                previewUrl={track.previewUrl}
                artworkUrl={artworkThumb}
                trackName={track.trackName}
                artistName={track.artistName}
              />
            ) : (
              <div
                className="rounded-2xl p-4 text-center text-sm"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                Preview non disponibile
              </div>
            )}

            {/* Metadata */}
            <div
              className="rounded-2xl p-4 border flex flex-col gap-3"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                Info brano
              </h3>
              {[
                { label: "Artista", value: track.artistName },
                { label: "Album", value: track.collectionName },
                { label: "Anno", value: formatReleaseYear(track.releaseDate) },
                { label: "Genere", value: track.primaryGenreName },
                { label: "Durata", value: formatDuration(track.trackTimeMillis) },
                ...(track.trackNumber ? [{ label: "Traccia", value: `#${track.trackNumber}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-xs shrink-0" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  <span className="text-xs text-right font-medium" style={{ color: "var(--foreground)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Apple Music link */}
            <a
              href={track.trackViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium border transition-all hover:opacity-80"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 6.5v6.75a.75.75 0 01-.75.75H9.25a.75.75 0 010-1.5h4.75V8.5a.75.75 0 011.5 0z" />
              </svg>
              Ascolta su Apple Music
            </a>
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Track header */}
            <div className="pt-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
                >
                  {track.primaryGenreName}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {formatReleaseYear(track.releaseDate)}
                </span>
              </div>
              <h1
                className="font-display text-3xl md:text-4xl font-bold leading-tight mb-1"
                style={{ color: "var(--foreground)" }}
              >
                {track.trackName}
              </h1>
              <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
                {track.artistName}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {track.collectionName}
              </p>
            </div>

            {/* Rating section — Steam style */}
            <div
              className="blob-bg rounded-2xl p-5 border flex flex-col md:flex-row md:items-center gap-6"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex-1">
                <RatingBadge label={label} avg={avg} count={reviews.length} />
              </div>

              {reviews.length > 0 && (
                <div className="flex-1 flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    Distribuzione voti
                  </p>
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3 text-right shrink-0" style={{ color: "var(--muted-foreground)" }}>
                          {star}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: star >= 7 ? "#10b981" : star >= 5 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                        {count > 0 && (
                          <span className="text-xs w-4 shrink-0" style={{ color: "var(--muted-foreground)" }}>
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reviews section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Recensioni degli utenti
                  {reviews.length > 0 && (
                    <span className="ml-2 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                      ({reviews.length})
                    </span>
                  )}
                </h2>

                {reviews.length > 1 && (
                  <div className="flex items-center gap-1">
                    {(["recent", "top", "lowest"] as SortKey[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className="text-xs px-3 py-1.5 rounded-xl transition-colors"
                        style={{
                          background: sort === s ? "var(--primary)" : "var(--secondary)",
                          color: sort === s ? "var(--primary-foreground)" : "var(--secondary-foreground)",
                        }}
                      >
                        {s === "recent" ? "Recenti" : s === "top" ? "Migliori" : "Peggiori"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ReviewForm trackId={track.trackId} onSubmit={refreshReviews} />

              {sorted.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center border"
                  style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <p className="text-2xl mb-2">🎵</p>
                  <p className="text-sm">Sii il primo a recensire questo brano!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {sorted.map((review) => (
                    <ReviewCard key={review.id} review={review} onVote={refreshReviews} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
