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

async function enrichAppleChartTracks(songs: AppleChartSong[]): Promise<ItunesTrack[]> {
  const randomSongs = [...songs].sort(() => Math.random() - 0.5).slice(0, 9);
  const ids = randomSongs.map((song) => song.id);
  const itunesTracks = ids.length ? await lookupTracks(ids) : [];
  const tracksById = new Map(itunesTracks.map((track) => [String(track.trackId), track]));

  return randomSongs.map((song, index) => {
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
