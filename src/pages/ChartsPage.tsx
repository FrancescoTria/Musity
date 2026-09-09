import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";
import { APPLE_MUSIC_COUNTRIES, getArtwork, getFullAppleChartTracks, ItunesTrack } from "../utils/itunes";

export default function ChartsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const countryParam = searchParams.get("country");
    const initialCountry = APPLE_MUSIC_COUNTRIES.some((item) => item.code === countryParam) ? countryParam! : "it";
    const [country, setCountry] = useState(initialCountry);
    const [query, setQuery] = useState("");
    const [countryMenuOpen, setCountryMenuOpen] = useState(false);
    const [tracks, setTracks] = useState<ItunesTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const selectedCountry = APPLE_MUSIC_COUNTRIES.find((item) => item.code === country);

    useEffect(() => {
        const nextCountry = APPLE_MUSIC_COUNTRIES.some((item) => item.code === countryParam) ? countryParam! : "it";
        if (nextCountry !== country) setCountry(nextCountry);
    }, [countryParam, country]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        getFullAppleChartTracks(country).then((nextTracks) => {
            if (!cancelled) setTracks(nextTracks);
        }).catch(() => {
            if (!cancelled) setError("Impossibile caricare questa classifica.");
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, [country]);

    const visibleTracks = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase();
        if (!normalized) return tracks;
        return tracks.filter((track) => `${track.trackName} ${track.artistName}`.toLocaleLowerCase().includes(normalized));
    }, [query, tracks]);

    return (
        <div className="min-h-full hero-gradient" style={{ color: "var(--foreground)" }}>
            <nav className="flex items-center justify-between px-6 py-4 md:px-10">
                <Link to="/" className="flex items-center gap-2">
                    <BrandLogo />
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="rounded-xl border px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--secondary-foreground)" }}
                    >
                        Torna alla home
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
                <header className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--primary)" }}>Apple Music charts</p>
                    <h1 className="font-display mt-2 text-4xl font-bold md:text-5xl">Top 100 {selectedCountry?.name}</h1>
                    <p className="mt-3" style={{ color: "var(--muted-foreground)" }}>Scopri la classifica completa e apri ogni brano per lasciarne una recensione.</p>
                </header>

                <section className="rounded-3xl border p-4 md:p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative md:w-64">
                            <button
                                type="button"
                                aria-haspopup="listbox"
                                aria-expanded={countryMenuOpen}
                                onClick={() => setCountryMenuOpen((open) => !open)}
                                className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm outline-none transition-colors focus:border-[var(--primary)]"
                                style={{ background: "var(--secondary)", borderColor: countryMenuOpen ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}
                            >
                                <span>{selectedCountry?.flag} {selectedCountry?.name}</span>
                                <svg className={`transition-transform ${countryMenuOpen ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ color: "var(--muted-foreground)" }}>
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>
                            {countryMenuOpen && (
                                <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border p-1 shadow-xl" role="listbox" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                                    {APPLE_MUSIC_COUNTRIES.map((item) => (
                                        <button
                                            key={item.code}
                                            type="button"
                                            role="option"
                                            aria-selected={country === item.code}
                                            onClick={() => { setCountry(item.code); setSearchParams({ country: item.code }); setCountryMenuOpen(false); }}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--secondary)]"
                                            style={{ background: country === item.code ? "var(--secondary)" : "transparent", color: "var(--foreground)" }}
                                        >
                                            <span>{item.flag}</span>
                                            <span>{item.name}</span>
                                            {country === item.code && <span className="ml-auto" style={{ color: "var(--primary)" }}>✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nella classifica..." className="min-w-0 flex-1 rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[var(--primary)]" style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    </div>

                    {loading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)" }}>
                            <div
                                className="flex h-16 w-16 animate-spin items-center justify-center rounded-2xl text-3xl"
                                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                                aria-label="Caricamento"
                                role="status"
                            >
                                ♪
                            </div>
                        </div>
                    )}
                    {error && <div className="py-16 text-center text-sm text-red-500">{error}</div>}
                    {!loading && !error && <div className="mt-5 flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
                        {visibleTracks.map((track, index) => (
                            <button key={track.trackId} onClick={() => navigate(`/track/${track.trackId}`, { state: { track } })} className="flex items-center gap-3 py-3 text-left transition-colors hover:bg-[var(--secondary)] md:gap-4 md:px-3">
                                <span className="w-7 shrink-0 text-center font-display text-lg font-semibold" style={{ color: index < 3 ? "var(--primary)" : "var(--muted-foreground)" }}>{tracks.indexOf(track) + 1}</span>
                                <img src={getArtwork(track.artworkUrl100, 120)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>{track.trackName}</span><span className="mt-0.5 block truncate text-xs" style={{ color: "var(--muted-foreground)" }}>{track.artistName} · {track.collectionName}</span></span>
                                <span className="hidden rounded-full px-2 py-1 text-xs sm:block" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>{track.primaryGenreName}</span>
                            </button>
                        ))}
                    </div>}
                </section>
            </main>
        </div>
    );
}