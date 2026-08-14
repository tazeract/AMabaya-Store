"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const sizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
}: StarRatingProps) {
  const filled = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - filled - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating} out of 5 stars${reviewCount ? `, ${reviewCount} reviews` : ""}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: filled }).map((_, i) => (
          <Star
            key={`f${i}`}
            className={`${sizes[size]} fill-[var(--color-champagne)] text-[var(--color-champagne)]`}
          />
        ))}
        {hasHalf && (
          <div className={`${sizes[size]} relative`}>
            <Star className={`${sizes[size]} text-[var(--color-border)]`} />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className={`${sizes[size]} fill-[var(--color-champagne)] text-[var(--color-champagne)]`} />
            </div>
          </div>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star
            key={`e${i}`}
            className={`${sizes[size]} text-[var(--color-border)]`}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-[var(--color-text-muted)]">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
