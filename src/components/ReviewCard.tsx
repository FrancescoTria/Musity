import { useState } from "react";
import { Review, voteReview } from "../utils/ratings";
import StarRating from "./StarRating";

interface ReviewCardProps {
  review: Review;
  onVote: () => void;
}

export default function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [voted, setVoted] = useState<"helpful" | "notHelpful" | null>(null);

  const vote = (type: "helpful" | "notHelpful") => {
    if (voted) return;
    voteReview(review.trackId, review.id, type);
    setVoted(type);
    onVote();
  };

  const dateStr = new Date(review.date).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 border transition-shadow hover:shadow-md"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold shrink-0"
            style={{ background: "var(--secondary)", color: "var(--primary)" }}
          >
            {review.author[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              {review.author}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {dateStr} · {review.playtime} ascolto
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <StarRating value={review.rating} size="sm" />
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
            {review.rating}/10
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--card-foreground)" }}>
        {review.text}
      </p>

      <div
        className="flex items-center gap-3 pt-2 border-t text-xs"
        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
      >
        <span>Questa recensione ti è stata utile?</span>
        <button
          onClick={() => vote("helpful")}
          disabled={!!voted}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
            voted === "helpful"
              ? "bg-emerald-500/20 text-emerald-500"
              : "hover:bg-[var(--secondary)]"
          } disabled:cursor-default`}
        >
          <span>👍</span>
          <span>{review.helpful + (voted === "helpful" ? 0 : 0)}</span>
        </button>
        <button
          onClick={() => vote("notHelpful")}
          disabled={!!voted}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
            voted === "notHelpful"
              ? "bg-red-500/20 text-red-500"
              : "hover:bg-[var(--secondary)]"
          } disabled:cursor-default`}
        >
          <span>👎</span>
          <span>{review.notHelpful + (voted === "notHelpful" ? 0 : 0)}</span>
        </button>
      </div>
    </div>
  );
}
