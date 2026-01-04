
import React, { useState, useEffect } from 'react';
import { Restaurant, Review } from '../types';
import { X, Star, DollarSign, Calendar, User, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id'>) => void;
  initialData?: Review;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ restaurant, isOpen, onClose, onSubmit, initialData }) => {
  const [userName, setUserName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [score, setScore] = useState(5);
  const [spent, setSpent] = useState<string>('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      setUserName(initialData.userName);
      setDate(initialData.date);
      setScore(initialData.score);
      setSpent(initialData.spent.toString());
      setComments(initialData.comments || '');
    } else if (isOpen) {
      // Reset for new entry
      setUserName('');
      setDate(new Date().toISOString().split('T')[0]);
      setScore(5);
      setSpent('');
      setComments('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      restaurantId: restaurant.id,
      userName,
      date,
      score,
      spent: parseFloat(spent) || 0,
      comments
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Review' : 'Add Review'}</h2>
            <p className="text-sm text-slate-500">{restaurant.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
              <User size={16} className="mr-2" /> Your Name
            </label>
            <input
              required
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Who are you?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
                <Calendar size={16} className="mr-2" /> Date
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
                <DollarSign size={16} className="mr-2" /> Spent
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
              <Star size={16} className="mr-2" /> Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScore(s)}
                  className={`p-2 rounded-lg transition-all ${
                    score >= s ? 'text-orange-500 bg-orange-50' : 'text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Star fill={score >= s ? 'currentColor' : 'none'} size={28} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
              <MessageSquare size={16} className="mr-2" /> Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
              rows={3}
              placeholder="What did you think of the food?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            {initialData ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
