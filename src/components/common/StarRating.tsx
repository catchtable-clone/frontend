import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  onRate?: (star: number) => void;
}

export default function StarRating({
  rating,
  size = 14,
  onRate,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) =>
        onRate ? (
          <button key={star} onClick={() => onRate(star)} type="button">
            <Star
              size={size}
              className={
                star <= rating
                  ? 'fill-orange-400 text-orange-400'
                  : 'text-gray-300'
              }
            />
          </button>
        ) : (
          <Star
            key={star}
            size={size}
            className={
              star <= rating
                ? 'fill-orange-400 text-orange-400'
                : 'text-gray-300'
            }
          />
        ),
      )}
    </div>
  );
}
