
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  mapsUrl: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  date: string;
  score: number; // 1-5
  spent: number;
  comments?: string;
}

export interface RestaurantWithStats extends Restaurant {
  reviews: Review[];
  averageScore: number;
  totalSpent: number;
}
