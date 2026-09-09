import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ItunesTrack, searchTracks, getArtwork } from "../utils/itunes";

interface SearchBarProps {
  large?: boolean;
  initialValue?: string;
  onSelect?: (track: ItunesTrack) => void;
  searchProvider?: (query: string) => Promise<ItunesTrack[]>;
}

export default function SearchBar({ large = false, initialValue = "", onSelect, searchProvider }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<ItunesTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = searchProvider ? await searchProvider(q) : await searchTracks(q, 8);
      setResults(res);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchProvider]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (track: ItunesTrack) => {
    setOpen(false);
    setQuery(track.trackName);
    if (onSelect) {
      onSelect(track);
    } else {
      navigate(`/track/${track.trackId}`, { state: { track } });
    }
  };

  const inputBase = large
    ? "w-full text-xl pl-14 pr-5 py-5 rounded-[28px] outline-none transition-all duration-300"
    : "w-full text-sm pl-10 pr-4 py-2.5 rounded-2xl outline-none transition-all duration-200";

  const shadowFocused = large
    ? "0 0 0 3px var(--ring), 0 20px 60px rgba(124,58,237,0.15)"
    : "0 0 0 2px var(--ring)";

  return (
    <div ref={containerRef} className={`relative ${large ? "w-full max-w-2xl" : "w-full"}`}>
      <div className="relative">
        {/* Search icon */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${large ? "left-5" : "left-3"}`}
          style={{ color: focused ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          {loading ? (
            <svg
              className="animate-spin"
              width={large ? 22 : 16}
              height={large ? 22 : 16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width={large ? 22 : 16} height={large ? 22 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={large ? "Cerca un brano, artista o album..." : "Cerca un brano..."}
          className={inputBase}
          style={{
            background: "var(--card)",
            color: "var(--foreground)",
            border: `1.5px solid ${focused ? "var(--ring)" : "var(--border)"}`,
            boxShadow: focused ? shadowFocused : large ? "0 8px 40px rgba(0,0,0,0.08)" : "none",
            fontFamily: "inherit",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length) select(results[0]);
            if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-50 shadow-2xl"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {results.map((track, idx) => (
            <button
              key={track.trackId}
              onClick={() => select(track)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--secondary)] border-b last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              <img
                src={getArtwork(track.artworkUrl100, 80)}
                alt={track.collectionName}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                  {track.trackName}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                  {track.artistName} · {track.collectionName}
                </p>
              </div>
              <div className="shrink-0 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                {track.primaryGenreName}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border px-4 py-6 text-center z-50"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <p className="text-sm">Nessun risultato per &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
