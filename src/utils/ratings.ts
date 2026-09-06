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

export function getReviews(trackId: number): Review[] {
  try {
    const stored = localStorage.getItem(`reviews_${trackId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
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
  type: "helpful" | "notHelpful"
): void {
  const reviews = getReviews(trackId);
  const review = reviews.find((r) => r.id === reviewId);
  if (!review) return;
  review[type] += 1;
  localStorage.setItem(`reviews_${trackId}`, JSON.stringify(reviews));
}

export function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
