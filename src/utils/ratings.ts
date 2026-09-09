export interface Review {
  id: string;
  trackId: number;
  author: string;
  rating: number; // 1-10
  text: string;
  date: string;
  helpful: number;
  notHelpful: number;
  playtime: string;
}

export type VoteType = "helpful" | "notHelpful";

export type SteamLabel =
  | "Overwhelmingly Positive"
  | "Very Positive"
  | "Mostly Positive"
  | "Mixed"
  | "Mostly Negative"
  | "Very Negative"
  | "Overwhelmingly Negative"
  | "No reviews yet";

export function getSteamLabel(avg: number, count: number): SteamLabel {
  if (count === 0) return "No reviews yet";
  if (avg >= 9) return "Overwhelmingly Positive";
  if (avg >= 8) return "Very Positive";
  if (avg >= 7) return "Mostly Positive";
  if (avg >= 5) return "Mixed";
  if (avg >= 4) return "Mostly Negative";
  if (avg >= 2) return "Very Negative";
  return "Overwhelmingly Negative";
}

export function getLabelColor(label: SteamLabel): string {
  switch (label) {
    case "Overwhelmingly Positive":
    case "Very Positive":
    case "Mostly Positive":
      return "text-emerald-500 dark:text-emerald-400";
    case "Mixed":
      return "text-amber-500 dark:text-amber-400";
    default:
      return "text-red-500 dark:text-red-400";
  }
}

const demoReviewTemplates: Omit<Review, "id" | "trackId">[] = [
  {
    author: "Luca B.",
    rating: 9,
    text: "Un brano davvero riuscito, con un'atmosfera che resta in testa anche dopo l'ascolto.",
    date: "2025-02-14T10:00:00.000Z",
    helpful: 18,
    notHelpful: 1,
    playtime: "Ascoltata spesso",
  },
  {
    author: "Marta R.",
    rating: 8,
    text: "Produzione molto curata e ritornello efficace. La riascolterei volentieri.",
    date: "2025-01-28T10:00:00.000Z",
    helpful: 11,
    notHelpful: 2,
    playtime: "Qualche ascolto",
  },
  {
    author: "Andrea P.",
    rating: 7,
    text: "Una buona canzone, piacevole da ascoltare e con qualche dettaglio interessante.",
    date: "2024-12-09T10:00:00.000Z",
    helpful: 7,
    notHelpful: 1,
    playtime: "Prima volta",
  },
];

function getDemoReviews(trackId: number): Review[] {
  return demoReviewTemplates.map((review, index) => ({
    ...review,
    id: `demo-${trackId}-${index + 1}`,
    trackId,
  }));
}

export function getReviews(trackId: number): Review[] {
  try {
    const stored = localStorage.getItem(`reviews_${trackId}`);
    const reviews = stored ? JSON.parse(stored) : [];
    return reviews.length > 0 ? reviews : getDemoReviews(trackId);
  } catch {
    return getDemoReviews(trackId);
  }
}

export function saveReview(review: Review): void {
  const reviews = getReviews(review.trackId);
  const idx = reviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    reviews[idx] = review;
  } else {
    reviews.unshift(review);
  }
  localStorage.setItem(`reviews_${review.trackId}`, JSON.stringify(reviews));
}

export function voteReview(
  trackId: number,
  reviewId: string,
  previousType: VoteType | null,
  newType: VoteType
): void {
  const reviews = getReviews(trackId);
  const review = reviews.find((r) => r.id === reviewId);
  if (!review) return;

  if (previousType) {
    review[previousType] = Math.max(0, review[previousType] - 1);
  }

  if (previousType !== newType) {
    review[newType] += 1;
  }

  localStorage.setItem(`reviews_${trackId}`, JSON.stringify(reviews));
}

export function getSavedVote(trackId: number, reviewId: string): VoteType | null {
  try {
    const saved = localStorage.getItem(`review_vote_${trackId}_${reviewId}`);
    return saved === "helpful" || saved === "notHelpful" ? saved : null;
  } catch {
    return null;
  }
}

export function saveVote(
  trackId: number,
  reviewId: string,
  vote: VoteType | null
): void {
  const key = `review_vote_${trackId}_${reviewId}`;

  if (vote) {
    localStorage.setItem(key, vote);
  } else {
    localStorage.removeItem(key);
  }
}

export function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
