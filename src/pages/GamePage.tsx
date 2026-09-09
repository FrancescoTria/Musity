import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";
import {
    APPLE_MUSIC_COUNTRIES,
    getAppleChartTracks,
    getArtwork,
    formatReleaseYear,
    ItunesTrack,
} from "../utils/itunes";

const CLIP_LENGTHS = [1, 3, 6, 10, 30];
const TOTAL_ROUNDS = 5;

type GameStatus = "setup" | "loading" | "playing" | "finished";

interface FailedAttempt {
    label: string;
    artist: string;
    seconds: number;
}

export default function GamePage() {
    const [country, setCountry] = useState("it");
    const [countryQuery, setCountryQuery] = useState("");
    const [tracks, setTracks] = useState<ItunesTrack[]>([]);
    const [chartTracks, setChartTracks] = useState<ItunesTrack[]>([]);
    const [round, setRound] = useState(0);
    const [stage, setStage] = useState(0);
    const [status, setStatus] = useState<GameStatus>("setup");
    const [locked, setLocked] = useState(false);
    const [message, setMessage] = useState("");
    const [failedAttempts, setFailedAttempts] = useState<FailedAttempt[]>([]);
    const [correctCount, setCorrectCount] = useState(0);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [resultTrack, setResultTrack] = useState<ItunesTrack | null>(null);
    const [resultWasCorrect, setResultWasCorrect] = useState(false);
    const [resultAttempts, setResultAttempts] = useState(1);
    const audioRef = useRef<HTMLAudioElement>(null);
    const stopTimerRef = useRef<number | null>(null);
    const clipLimitRef = useRef(CLIP_LENGTHS[0]);
    const playStartedAtRef = useRef<number | null>(null);
    const progressFillRef = useRef<HTMLDivElement>(null);
    const resultAudioRef = useRef<HTMLAudioElement>(null);

    const stopAudio = () => {
        if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        playStartedAtRef.current = null;
        if (progressFillRef.current) progressFillRef.current.style.width = "0%";
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const playClip = (clipStage: number) => {
        const audio = audioRef.current;
        const track = tracks[round];
        if (!audio || !track?.previewUrl) return;

        const clipLimit = CLIP_LENGTHS[clipStage];
        clipLimitRef.current = clipLimit;
        stopAudio();
        audio.src = track.previewUrl;
        audio.currentTime = 0;
        setCurrentTime(0);
        void audio.play().then(() => {
            playStartedAtRef.current = performance.now();
            setIsPlaying(true);
            stopTimerRef.current = window.setTimeout(() => {
                audio.pause();
                audio.currentTime = clipLimit;
                if (progressFillRef.current) progressFillRef.current.style.width = `${(clipLimit / 30) * 100}%`;
                setCurrentTime(clipLimit);
                setIsPlaying(false);
            }, clipLimit * 1000);
        }).catch(() => undefined);
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            playClip(stage);
        }
    };

    const prepareRound = (nextRound: number, nextTracks: ItunesTrack[]) => {
        setRound(nextRound);
        setStage(0);
        setLocked(false);
        setMessage("");
        setFailedAttempts([]);
        setCurrentTime(0);
        setResultTrack(null);
        setResultWasCorrect(false);
        setResultAttempts(1);
        setStatus("playing");
    };

    const startGame = async () => {
        stopAudio();
        setStatus("loading");
        setError("");
        try {
            const chart = await getAppleChartTracks(country, 50);
            const playableChart = chart.filter((track) => track.previewUrl);
            const playable = playableChart.slice(0, TOTAL_ROUNDS);
            if (playable.length < TOTAL_ROUNDS) {
                throw new Error("Non ci sono abbastanza preview disponibili per questa classifica.");
            }
            setChartTracks(playableChart);
            setTracks(playable);
            setCorrectCount(0);
            prepareRound(0, playable);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Impossibile caricare la classifica.");
            setStatus("setup");
        }
    };

    const searchChart = useCallback(async (query: string): Promise<ItunesTrack[]> => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        return chartTracks
            .filter((track) =>
                track.trackName.trim().toLocaleLowerCase().startsWith(normalizedQuery) ||
                track.artistName.trim().toLocaleLowerCase().startsWith(normalizedQuery),
            )
            .slice(0, 8);
    }, [chartTracks]);

    const answer = (track: ItunesTrack) => {
        if (locked) return;
        stopAudio();
        const correct = track.trackId === tracks[round].trackId;

        if (correct) {
            setFailedAttempts((attempts) => [
                ...attempts,
                { label: track.trackName, artist: track.artistName, seconds: CLIP_LENGTHS[stage] },
            ]);
            setLocked(true);
            setCorrectCount((value) => value + 1);
            setMessage("Esatto!");
            setResultTrack(tracks[round]);
            setResultWasCorrect(true);
            setResultAttempts(failedAttempts.length + 1);
        } else if (stage < CLIP_LENGTHS.length - 1) {
            setFailedAttempts((attempts) => [
                ...attempts,
                { label: track.trackName, artist: track.artistName, seconds: CLIP_LENGTHS[stage] },
            ]);
            setStage((value) => value + 1);
            setMessage(`Non è questa. Ora hai ${CLIP_LENGTHS[stage + 1]} secondi.`);
            return;
        } else {
            setFailedAttempts((attempts) => [
                ...attempts,
                { label: track.trackName, artist: track.artistName, seconds: CLIP_LENGTHS[stage] },
            ]);
            setMessage(`Era ${tracks[round].trackName} di ${tracks[round].artistName}.`);
            setLocked(true);
            setResultTrack(tracks[round]);
            setResultWasCorrect(false);
        }
    };

    const skipRound = () => {
        if (locked) return;
        stopAudio();
        if (stage < CLIP_LENGTHS.length - 1) {
            setFailedAttempts((attempts) => [
                ...attempts,
                { label: "Tentativo saltato", artist: "", seconds: CLIP_LENGTHS[stage] },
            ]);
            setStage((value) => value + 1);
            setMessage(`Hai saltato. Ora hai ${CLIP_LENGTHS[stage + 1]} secondi.`);
            return;
        }

        setLocked(true);
        setFailedAttempts((attempts) => [
            ...attempts,
            { label: "Mi arrendo", artist: "", seconds: CLIP_LENGTHS[stage] },
        ]);
        setMessage(`Era ${tracks[round].trackName} di ${tracks[round].artistName}.`);
        setResultTrack(tracks[round]);
        setResultWasCorrect(false);
    };

    const continueGame = () => {
        const nextRound = round + 1;
        setResultTrack(null);
        if (nextRound >= TOTAL_ROUNDS) {
            setStatus("finished");
        } else {
            prepareRound(nextRound, tracks);
        }
    };

    useEffect(() => () => stopAudio(), []);

    useEffect(() => {
        if (!isPlaying) return;

        let frameId = 0;
        const updateProgress = () => {
            if (playStartedAtRef.current !== null) {
                const elapsed = (performance.now() - playStartedAtRef.current) / 1000;
                const progress = Math.min(elapsed, clipLimitRef.current);
                if (progressFillRef.current) progressFillRef.current.style.width = `${(progress / 30) * 100}%`;
                setCurrentTime(progress);
            }
            frameId = window.requestAnimationFrame(updateProgress);
        };

        frameId = window.requestAnimationFrame(updateProgress);
        return () => window.cancelAnimationFrame(frameId);
    }, [isPlaying]);

    useEffect(() => {
        const audio = resultAudioRef.current;
        if (!audio || !resultTrack?.previewUrl) return;

        audio.src = resultTrack.previewUrl;
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);

        return () => {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute("src");
            audio.load();
        };
    }, [resultTrack]);

    const selectedCountry = APPLE_MUSIC_COUNTRIES.find((item) => item.code === country);
    const filteredCountries = APPLE_MUSIC_COUNTRIES.filter((item) =>
        `${item.name} ${item.code}`.toLowerCase().includes(countryQuery.toLowerCase().trim()),
    );
    const currentTrack = tracks[round];

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

            <main className="max-w-3xl mx-auto px-5 py-8 md:py-14">
                <div className="text-center mb-8">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: "var(--primary)" }}>Apple Music challenge</p>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Indovina la canzone</h1>
                    <p className="mt-3" style={{ color: "var(--muted-foreground)" }}>Ascolta la preview e riconosci il brano prima che il tempo finisca.</p>
                </div>

                {status === "setup" && (
                    <section className="rounded-3xl p-6 md:p-8 border" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 20px 60px rgba(30, 20, 70, .08)" }}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-display text-2xl font-semibold">Scegli la tua classifica</h2>
                                <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>Scegli il paese della Top 100 Apple Music da cui pescare le canzoni.</p>
                            </div>
                            <span className="hidden sm:block text-2xl">{selectedCountry?.flag}</span>
                        </div>
                        <div className="relative mt-6">
                            <input
                                value={countryQuery}
                                onChange={(event) => setCountryQuery(event.target.value)}
                                placeholder="Cerca un paese..."
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
                                style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)" }}
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 max-h-72 overflow-y-auto pr-1">
                            {filteredCountries.map((item) => (
                                <button key={item.code} onClick={() => setCountry(item.code)} className="flex items-center gap-2 p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5" style={{ background: country === item.code ? "var(--secondary)" : "transparent", borderColor: country === item.code ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}>
                                    <span className="text-lg">{item.flag}</span>
                                    <span className="text-xs font-medium truncate">{item.name}</span>
                                </button>
                            ))}
                        </div>
                        {filteredCountries.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>Nessun paese trovato.</p>}
                        <button onClick={startGame} className="w-full mt-5 py-3 rounded-2xl font-semibold transition-opacity hover:opacity-90" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Inizia con {selectedCountry?.name}</button>
                        {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}
                    </section>
                )}

                {status === "loading" && <div className="text-center py-20" style={{ color: "var(--muted-foreground)" }}>Caricamento della Top {selectedCountry?.name}...</div>}

                {status === "playing" && currentTrack && (
                    <section className="min-h-[540px] px-1 md:px-6 py-2" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                            <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
                            <span>{correctCount} indovinate</span>
                        </div>

                        <div className="mt-5">
                            <SearchBar key={`${round}-${stage}`} large onSelect={answer} searchProvider={searchChart} />
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Tentativi</p>
                            {CLIP_LENGTHS.map((seconds, index) => {
                                const attempt = failedAttempts[index];
                                return (
                                    <div key={seconds} className="flex min-h-10 items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ background: attempt ? "var(--secondary)" : "transparent", borderColor: "var(--border)" }}>
                                        {attempt ? (
                                            <>
                                                <span className="truncate" style={{ color: "var(--foreground)" }}>{attempt.label}{attempt.artist ? ` · ${attempt.artist}` : ""}</span>
                                                <span className="ml-3 shrink-0 text-xs" style={{ color: "var(--muted-foreground)" }}>{attempt.seconds}s</span>
                                            </>
                                        ) : (
                                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Tentativo {index + 1}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-sm font-semibold">{CLIP_LENGTHS[stage]} second{CLIP_LENGTHS[stage] !== 1 ? "i" : "o"}</span>
                                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{message || "Ascolta e indovina"}</span>
                            </div>
                            <div className="relative h-6 overflow-hidden rounded-sm" style={{ background: "var(--secondary)" }}>
                                <div ref={progressFillRef} className="absolute inset-y-0 left-0" style={{ width: `${Math.min((currentTime / 30) * 100, 100)}%`, background: "var(--primary)" }} />
                                {CLIP_LENGTHS.map((length) => (
                                    <div key={length} className="absolute inset-y-0 border-r-2" style={{ left: `${(length / 30) * 100}%`, borderColor: "var(--background)" }} />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}><span>{currentTime.toFixed(1)}s</span><span>30s</span></div>
                        </div>

                        <div className="flex justify-center mt-7">
                            <button
                                onClick={togglePlay}
                                aria-label={isPlaying ? "Metti in pausa la preview" : "Riproduci la preview"}
                                className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                            >
                                {isPlaying ? (
                                    <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" aria-hidden="true">
                                        <rect x="3" y="2" width="5" height="18" rx="1" />
                                        <rect x="12" y="2" width="5" height="18" rx="1" />
                                    </svg>
                                ) : (
                                    <svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor" aria-hidden="true">
                                        <path d="M19.4 10.3c1.1.7 1.1 2.7 0 3.4L4.1 23C2.9 23.7 1.5 22.9 1.5 21.5v-19C1.5 1.1 2.9.3 4.1 1l15.3 9.3Z" />
                                    </svg>
                                )}
                            </button>
                            <audio ref={audioRef} onEnded={stopAudio} />
                        </div>
                        <button onClick={skipRound} disabled={locked} className="block mx-auto mt-5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-40" style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--secondary-foreground)" }}>
                            {stage === CLIP_LENGTHS.length - 1 ? "Mi arrendo" : "Salta"}
                        </button>
                    </section>
                )}

                {status === "finished" && (
                    <section className="text-center rounded-3xl p-8 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                        <p className="text-5xl">🎧</p><h2 className="font-display text-3xl font-bold mt-4">Partita completata</h2><p className="mt-3" style={{ color: "var(--muted-foreground)" }}>Hai indovinato</p><p className="font-display text-6xl font-bold" style={{ color: "var(--primary)" }}>{correctCount}</p><p style={{ color: "var(--muted-foreground)" }}>{correctCount === 1 ? "canzone" : "canzoni"} nella Top {selectedCountry?.name}</p><button onClick={() => setStatus("setup")} className="mt-7 px-6 py-3 rounded-2xl font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Gioca ancora</button>
                    </section>
                )}
            </main>

            {resultTrack && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm">
                    <section className="w-full max-w-md rounded-3xl border p-5 shadow-2xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--primary)" }}>Brano rivelato</p>
                        <p className="mt-2 text-sm font-semibold" style={{ color: resultWasCorrect ? "#16a34a" : "var(--muted-foreground)" }}>
                            {resultWasCorrect ? `Hai indovinato con ${resultAttempts} ${resultAttempts === 1 ? "tentativo" : "tentativi"}!` : "Ecco la soluzione"}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                            <img src={getArtwork(resultTrack.artworkUrl100, 240)} alt={`Copertina di ${resultTrack.trackName}`} className="h-24 w-24 rounded-2xl object-cover shadow-lg" />
                            <div className="min-w-0">
                                <h2 className="font-display text-xl font-bold leading-tight break-words" style={{ color: "var(--foreground)" }}>{resultTrack.trackName}</h2>
                                <p className="truncate text-sm" style={{ color: "var(--muted-foreground)" }}>{resultTrack.artistName}</p>
                                <p className="mt-1 truncate text-xs" style={{ color: "var(--muted-foreground)" }}>{resultTrack.collectionName} · {formatReleaseYear(resultTrack.releaseDate)}</p>
                            </div>
                        </div>
                        <button onClick={continueGame} className="mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity hover:opacity-90" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                            Prosegui
                        </button>
                        <audio ref={resultAudioRef} aria-label="Preview del brano rivelato" />
                    </section>
                </div>
            )}
        </div>
    );
}
