import { Star } from "lucide-react";

interface Props {
  /** Filled stars (0–3). */
  value: number;
  size?: number;
  /** Show empty outlines for unearned stars. */
  showEmpty?: boolean;
  className?: string;
}

/** Three-star rating display. */
export default function StarRating({ value, size = 20, showEmpty = true, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value} of 3 stars`}
    >
      {[1, 2, 3].map((n) =>
        n <= value || showEmpty ? (
          <Star
            key={n}
            size={size}
            aria-hidden="true"
            className={
              n <= value
                ? "fill-yellow-400 text-yellow-600 drop-shadow"
                : "fill-stone-300/70 text-stone-400"
            }
          />
        ) : null,
      )}
    </span>
  );
}
