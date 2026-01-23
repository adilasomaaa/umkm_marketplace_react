import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
    initialRating?: number; 
    onRatingChange: (rating: number) => void; 
    disabled?: boolean;
}

const RatingInput: React.FC<RatingInputProps> = ({ initialRating = 0, onRatingChange, disabled = false }) => {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);

    const handleStarClick = (index: number) => {
        if (disabled) return;
        setRating(index); // Set rating ke nilai yang diklik
        onRatingChange(index); // Panggil callback
    };

    return (
        <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleStarClick(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        disabled={disabled}
                        className={`
                            // Styling dasar
                            transition-colors duration-200 focus:outline-none 
                            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        `}
                    >
                        <Star
                            size={24}
                            fill={ratingValue <= (hover || rating) ? '#FFC107' : 'none'} // Emas/Kuning untuk bintang yang terisi
                            stroke={ratingValue <= (hover || rating) ? '#FFC107' : '#BDBDBD'} // Garis luar
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default RatingInput;