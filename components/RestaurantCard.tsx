
import React, { useState } from 'react';
import { RestaurantWithStats, Review } from '../types';
import { Star, MapPin, ChevronDown, ChevronUp, ExternalLink, MessageCircle } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: RestaurantWithStats;
  onAddReview: (restaurant: RestaurantWithStats) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onAddReview }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {restaurant.name}
              {restaurant.mapsUrl && (
                <a 
                  href={restaurant.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </h3>
            <div className="flex items-center text-slate-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              {restaurant.address}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold border border-orange-100">
              <Star size={16} className="mr-1 fill-orange-500" />
              {restaurant.averageScore.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {restaurant.reviews.length} review{restaurant.reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex -space-x-2">
            {restaurant.reviews.slice(0, 3).map((r, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                {r.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {restaurant.reviews.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                +{restaurant.reviews.length - 3}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAddReview(restaurant)}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add Review
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-50 bg-slate-50/50 p-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Guest Log</h4>
          {restaurant.reviews.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No reviews yet. Be the first!</p>
          ) : (
            restaurant.reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{review.userName}</span>
                    <span className="text-xs text-slate-400">• {new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-orange-500">
                    {Array.from({ length: review.score }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                {review.comments && (
                  <p className="text-sm text-slate-600 mb-2 italic">"{review.comments}"</p>
                )}
                <div className="text-xs font-medium text-slate-400 flex items-center">
                  <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded mr-2">
                    ${review.spent.toFixed(2)}
                  </span>
                  spent on this meal
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;
