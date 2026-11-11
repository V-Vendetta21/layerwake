import { useState } from 'react';
import { StarRatingFill } from './star-rating-fill';

export default function Demo() {
  const [rating, setRating] = useState(0);
  return (
    <StarRatingFill
      value={rating}
      onChange={setRating}
      label='How was the harbor?'
    />
  );
}
