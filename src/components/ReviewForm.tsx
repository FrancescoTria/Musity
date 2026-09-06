import { useState } from "react";
import { Review, generateId, saveReview } from "../utils/ratings";
import StarRating from "./StarRating";

interface ReviewFormProps {
  trackId: number;
  onSubmit: () => void;
}

const playtimeOptions = [
  "Prima volta", "Qualche ascolto", "Ascoltata spesso", "La conosco a memoria"
];

export default function ReviewForm({ trackId, onSubmit }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [playtime, setPlaytime] = useState(playtimeOptions[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) return setError("Inserisci un nome.");
    if (rating === 0) return setError("Scegli un voto da 1 a 10.");
    if (text.trim().length < 20) return setError("La recensione deve essere di almeno 20 caratteri.");

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const review: Review = {
      id: generateId(),
      trackId,
      author: author.trim(),
      rating,
      text: text.trim(),
      date: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
      playtime,
    };

    saveReview(review);
    setOpen(false);
    setAuthor("");
    setRating(0);
    setText("");
    setError("");
    setSubmitting(false);
    onSubmit();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        + Scrivi una recensione
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl p-5 border flex flex-col gap-4"
      style={{ background: "var(--card)", borderColor: "var(--primary)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
          La tua recensione
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-[var(--secondary)]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Annulla
        </button>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          Nome
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Il tuo nome"
          maxLength={40}
          className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors focus:border-[var(--primary)]"
          style={{
            background: "var(--secondary)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          Voto (1–10)
        </label>
        <StarRating value={rating} onChange={setRating} size="md" />
        {rating > 0 && (
          <span className="text-xs mt-1 block" style={{ color: "var(--muted-foreground)" }}>
            {rating}/10 — {rating >= 9 ? "Capolavoro" : rating >= 7 ? "Ottimo" : rating >= 5 ? "Nella media" : rating >= 3 ? "Deludente" : "Pessimo"}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          Quanto la conosci?
        </label>
        <div className="flex flex-wrap gap-2">
          {playtimeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setPlaytime(opt)}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors"
              style={{
                background: playtime === opt ? "var(--primary)" : "var(--secondary)",
                color: playtime === opt ? "var(--primary-foreground)" : "var(--secondary-foreground)",
                borderColor: playtime === opt ? "var(--primary)" : "var(--border)",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          Recensione
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrivi cosa pensi di questo brano..."
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors focus:border-[var(--primary)] resize-none"
          style={{
            background: "var(--secondary)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {text.length}/1000
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        {submitting ? "Pubblicazione..." : "Pubblica recensione"}
      </button>
    </form>
  );
}
