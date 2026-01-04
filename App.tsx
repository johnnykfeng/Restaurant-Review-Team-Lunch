
import React, { useState, useEffect, useCallback } from 'react';
import { Restaurant, Review, RestaurantWithStats } from './types';
import { searchRestaurants } from './services/geminiService';
import ReviewModal from './components/ReviewModal';
import RestaurantCard from './components/RestaurantCard';
import { Search, Plus, Utensils, Star, MapPin, Loader2, Sparkles } from 'lucide-react';

const STORAGE_KEY_RESTAURANTS = 'biteclub_restaurants';
const STORAGE_KEY_REVIEWS = 'biteclub_reviews';

const App: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [selectedRestaurantForReview, setSelectedRestaurantForReview] = useState<Restaurant | null>(null);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | undefined>(undefined);

  // Initialize data from localStorage
  useEffect(() => {
    const storedRestaurants = localStorage.getItem(STORAGE_KEY_RESTAURANTS);
    const storedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (storedRestaurants) setRestaurants(JSON.parse(storedRestaurants));
    if (storedReviews) setReviews(JSON.parse(storedReviews));

    // Request location for better search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation(pos.coords),
        (err) => console.warn("Location permission denied", err)
      );
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchRestaurants(searchQuery, userLocation);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddReview = (reviewData: Omit<Review, 'id'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
    };

    setReviews(prev => [...prev, newReview]);

    // Ensure restaurant is in the database
    if (!restaurants.some(r => r.id === reviewData.restaurantId)) {
      const restaurantToAdd = searchResults.find(r => r.id === reviewData.restaurantId);
      if (restaurantToAdd) {
        setRestaurants(prev => [...prev, restaurantToAdd]);
      }
    }
    
    setSearchResults([]);
    setSearchQuery('');
  };

  const getAggregatedData = (): RestaurantWithStats[] => {
    return restaurants.map(rest => {
      const restReviews = reviews.filter(rev => rev.restaurantId === rest.id);
      const totalScore = restReviews.reduce((acc, curr) => acc + curr.score, 0);
      const totalSpent = restReviews.reduce((acc, curr) => acc + curr.spent, 0);
      return {
        ...rest,
        reviews: restReviews,
        averageScore: restReviews.length > 0 ? totalScore / restReviews.length : 0,
        totalSpent
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  };

  const dashboardData = getAggregatedData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <Utensils size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">BiteClub</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Stats</span>
             <span className="text-sm font-semibold text-slate-600">{reviews.length} Experiences Shared</span>
           </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        {/* Search / Add Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Sparkles size={24} className="text-orange-500" />
              Where did you eat?
            </h2>
            <p className="text-slate-500">Search for a restaurant to add your review.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurant by name..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Search"}
            </button>
          </form>

          {/* Search Results Dropdown-like UI */}
          {searchResults.length > 0 && (
            <div className="mt-4 border border-slate-200 rounded-2xl bg-white overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2">
              {searchResults.map((result) => (
                <div key={result.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{result.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin size={12} /> {result.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRestaurantForReview(result)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={16} /> Review
                  </button>
                </div>
              ))}
              <div className="p-2 bg-slate-50 flex justify-center">
                 <button 
                  onClick={() => setSearchResults([])}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-4 py-1"
                >
                  Clear Results
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Dashboard Section */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Recent Club Visits</h2>
              <p className="text-slate-500">The group's latest culinary adventures.</p>
            </div>
            {dashboardData.length > 0 && (
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1 text-orange-500">
                  <Star size={16} className="fill-orange-500" /> Top Rated First
                </div>
              </div>
            )}
          </div>

          {dashboardData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No restaurants reviewed yet</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                Search for your first restaurant above to start building the BiteClub database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {dashboardData.map((rest) => (
                <RestaurantCard 
                  key={rest.id} 
                  restaurant={rest} 
                  onAddReview={(r) => setSelectedRestaurantForReview(r)} 
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Review Modal */}
      {selectedRestaurantForReview && (
        <ReviewModal
          isOpen={true}
          restaurant={selectedRestaurantForReview}
          onClose={() => setSelectedRestaurantForReview(null)}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
};

export default App;
