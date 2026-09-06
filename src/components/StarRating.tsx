interface StarRatingProps {
  value: number; // 1-10
  onChange?: (val: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const sz = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const stars = 10;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating: ${value} out of 10`}>
      {Array.from({ length: stars }, (_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={onChange ? () => onChange(i + 1) : undefined}
            disabled={!onChange}
            className="transition-transform hover:scale-110 disabled:cursor-default"
            aria-label={`${i + 1} star`}
          >
            <svg width={sz} height={sz} viewBox="0 0 20 20" fill={filled ? "var(--primary)" : "var(--border)"}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
