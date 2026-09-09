export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string | null;
  trackTimeMillis: number;
  releaseDate: string;
  primaryGenreName: string;
  trackViewUrl: string;
  collectionId: number;
  discCount: number;
  trackNumber: number;
  country: string;
  currency: string;
  trackPrice: number;
  collectionArtistName?: string;
  kind: string;
  wrapperType: string;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

interface AppleChartSong {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100: string;
  url: string;
  releaseDate: string;
  genres?: { name: string }[];
}

interface AppleChartResponse {
  feed: {
    results: AppleChartSong[];
  };
}

const NON_AMERICAN_STOREFRONTS = ["it", "gb", "jp", "de", "fr", "es", "au", "kr", "in"];

export const APPLE_MUSIC_COUNTRIES = [
  { code: "us", name: "Stati Uniti", flag: "🇺🇸" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "mx", name: "Messico", flag: "🇲🇽" },
  { code: "br", name: "Brasile", flag: "🇧🇷" },
  { code: "ar", name: "Argentina", flag: "🇦🇷" },
  { code: "cl", name: "Cile", flag: "🇨🇱" },
  { code: "co", name: "Colombia", flag: "🇨🇴" },
  { code: "pe", name: "Perù", flag: "🇵🇪" },
  { code: "ec", name: "Ecuador", flag: "🇪🇨" },
  { code: "cr", name: "Costa Rica", flag: "🇨🇷" },
  { code: "gb", name: "Regno Unito", flag: "🇬🇧" },
  { code: "ie", name: "Irlanda", flag: "🇮🇪" },
  { code: "de", name: "Germania", flag: "🇩🇪" },
  { code: "fr", name: "Francia", flag: "🇫🇷" },
  { code: "es", name: "Spagna", flag: "🇪🇸" },
  { code: "it", name: "Italia", flag: "🇮🇹" },
  { code: "pt", name: "Portogallo", flag: "🇵🇹" },
  { code: "nl", name: "Paesi Bassi", flag: "🇳🇱" },
  { code: "be", name: "Belgio", flag: "🇧🇪" },
  { code: "ch", name: "Svizzera", flag: "🇨🇭" },
  { code: "at", name: "Austria", flag: "🇦🇹" },
  { code: "dk", name: "Danimarca", flag: "🇩🇰" },
  { code: "se", name: "Svezia", flag: "🇸🇪" },
  { code: "no", name: "Norvegia", flag: "🇳🇴" },
  { code: "fi", name: "Finlandia", flag: "🇫🇮" },
  { code: "is", name: "Islanda", flag: "🇮🇸" },
  { code: "pl", name: "Polonia", flag: "🇵🇱" },
  { code: "cz", name: "Repubblica Ceca", flag: "🇨🇿" },
  { code: "sk", name: "Slovacchia", flag: "🇸🇰" },
  { code: "hu", name: "Ungheria", flag: "🇭🇺" },
  { code: "ro", name: "Romania", flag: "🇷🇴" },
  { code: "bg", name: "Bulgaria", flag: "🇧🇬" },
  { code: "gr", name: "Grecia", flag: "🇬🇷" },
  { code: "hr", name: "Croazia", flag: "🇭🇷" },
  { code: "si", name: "Slovenia", flag: "🇸🇮" },
  { code: "rs", name: "Serbia", flag: "🇷🇸" },
  { code: "ua", name: "Ucraina", flag: "🇺🇦" },
  { code: "ee", name: "Estonia", flag: "🇪🇪" },
  { code: "lv", name: "Lettonia", flag: "🇱🇻" },
  { code: "lt", name: "Lituania", flag: "🇱🇹" },
  { code: "tr", name: "Turchia", flag: "🇹🇷" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "nz", name: "Nuova Zelanda", flag: "🇳🇿" },
  { code: "jp", name: "Giappone", flag: "🇯🇵" },
  { code: "kr", name: "Corea del Sud", flag: "🇰🇷" },
  { code: "cn", name: "Cina", flag: "🇨🇳" },
  { code: "hk", name: "Hong Kong", flag: "🇭🇰" },
  { code: "tw", name: "Taiwan", flag: "🇹🇼" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "my", name: "Malesia", flag: "🇲🇾" },
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "ph", name: "Filippine", flag: "🇵🇭" },
  { code: "th", name: "Thailandia", flag: "🇹🇭" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "il", name: "Israele", flag: "🇮🇱" },
  { code: "ae", name: "Emirati Arabi Uniti", flag: "🇦🇪" },
  { code: "sa", name: "Arabia Saudita", flag: "🇸🇦" },
  { code: "qa", name: "Qatar", flag: "🇶🇦" },
  { code: "kw", name: "Kuwait", flag: "🇰🇼" },
  { code: "eg", name: "Egitto", flag: "🇪🇬" },
  { code: "za", name: "Sudafrica", flag: "🇿🇦" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬" },
  { code: "ke", name: "Kenya", flag: "🇰🇪" },
];

export function getArtwork(url: string, size = 600): string {
  return url.replace("100x100bb", `${size}x${size}bb`);
}

export async function getRandomAppleChartTracks(): Promise<ItunesTrack[]> {
  const cachedChart = localStorage.getItem("musity-apple-chart");
  const cachedAt = Number(localStorage.getItem("musity-apple-chart-time"));
  const cacheIsFresh = cachedChart && Date.now() - cachedAt < 60 * 60 * 1000;

  if (cacheIsFresh) {
    return enrichAppleChartTracks(JSON.parse(cachedChart) as AppleChartSong[]);
  }

  const responses = await Promise.all(
    NON_AMERICAN_STOREFRONTS.map(async (storefront) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`/api/apple-music/api/v2/${storefront}/music/most-played/100/songs.json`, {
          signal: controller.signal,
        });
        if (!res.ok) return [];
        const data: AppleChartResponse = await res.json();
        return data.feed.results;
      } catch {
        return [];
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
  const songs = [...new Map(responses.flat().map((song) => [song.id, song])).values()];
  if (!songs.length) throw new Error("Apple Music chart is empty");
  localStorage.setItem("musity-apple-chart", JSON.stringify(songs));
  localStorage.setItem("musity-apple-chart-time", String(Date.now()));

  return enrichAppleChartTracks(songs);
}

export async function getAppleChartTracks(
  storefront: string,
  limit = 25,
): Promise<ItunesTrack[]> {
  const res = await fetch(`/api/apple-music/api/v2/${storefront}/music/most-played/${limit}/songs.json`);
  if (!res.ok) throw new Error("Apple Music chart unavailable");
  const data: AppleChartResponse = await res.json();
  return enrichAppleChartTracks(data.feed.results, limit);
}

export async function getFullAppleChartTracks(storefront: string): Promise<ItunesTrack[]> {
  const res = await fetch(`/api/apple-music/api/v2/${storefront}/music/most-played/100/songs.json`);
  if (!res.ok) throw new Error("Apple Music chart unavailable");
  const data: AppleChartResponse = await res.json();
  return enrichAppleChartTracks(data.feed.results, 100, false);
}

async function enrichAppleChartTracks(songs: AppleChartSong[], limit = 9, randomize = true): Promise<ItunesTrack[]> {
  const selectedSongs = randomize ? [...songs].sort(() => Math.random() - 0.5).slice(0, limit) : songs.slice(0, limit);
  const ids = selectedSongs.map((song) => song.id);
  const itunesTracks = ids.length ? await lookupTracks(ids) : [];
  const tracksById = new Map(itunesTracks.map((track) => [String(track.trackId), track]));

  return selectedSongs.map((song, index) => {
    return tracksById.get(song.id) ?? {
      trackId: Number(song.id.match(/id(\d+)/)?.[1] ?? index),
      trackName: song.name,
      artistName: song.artistName,
      collectionName: "Apple Music Top Songs",
      artworkUrl100: song.artworkUrl100,
      previewUrl: null,
      trackTimeMillis: 0,
      releaseDate: song.releaseDate,
      primaryGenreName: song.genres?.[0]?.name ?? "Music",
      trackViewUrl: song.url,
      collectionId: 0,
      discCount: 0,
      trackNumber: 0,
      country: "US",
      currency: "USD",
      trackPrice: 0,
      kind: "song",
      wrapperType: "track",
    };
  });
}

async function lookupTracks(ids: string[]): Promise<ItunesTrack[]> {
  const url = `https://itunes.apple.com/lookup?id=${ids.join(",")}&entity=song`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: ItunesSearchResponse = await res.json();
  return data.results.filter((track) => track.wrapperType === "track");
}

export async function searchTracks(term: string, limit = 10, attribute?: "artistTerm"): Promise<ItunesTrack[]> {
  if (!term.trim()) return [];
  const attributeParam = attribute ? `&attribute=${attribute}` : "";
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}${attributeParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const data: ItunesSearchResponse = await res.json();
  return data.results;
}

export async function lookupTrack(trackId: number): Promise<ItunesTrack | null> {
  const url = `https://itunes.apple.com/lookup?id=${trackId}&entity=song`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: ItunesSearchResponse = await res.json();
  return data.results[0] ?? null;
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatReleaseYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString();
}
