
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Restaurant, Review } from '../types';

const STORAGE_KEY_RESTAURANTS = 'biteclub_restaurants';
const STORAGE_KEY_REVIEWS = 'biteclub_reviews';
const CLOUD_CONFIG_KEY = 'biteclub_cloud_config';

interface CloudConfig {
  url: string;
  key: string;
}

class DBService {
  private supabase: SupabaseClient | null = null;
  private config: CloudConfig | null = null;

  constructor() {
    const stored = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (stored) {
      this.config = JSON.parse(stored);
      this.initSupabase();
    }
  }

  private initSupabase() {
    if (this.config) {
      this.supabase = createClient(this.config.url, this.config.key);
    }
  }

  setCloudConfig(config: CloudConfig | null) {
    if (config) {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
      this.config = config;
      this.initSupabase();
    } else {
      localStorage.removeItem(CLOUD_CONFIG_KEY);
      this.config = null;
      this.supabase = null;
    }
  }

  getCloudConfig() {
    return this.config;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('restaurants').select('*');
      if (!error && data) return data;
    }
    const local = localStorage.getItem(STORAGE_KEY_RESTAURANTS);
    return local ? JSON.parse(local) : [];
  }

  async getReviews(): Promise<Review[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('reviews').select('*');
      if (!error && data) return data;
    }
    const local = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return local ? JSON.parse(local) : [];
  }

  async saveRestaurant(restaurant: Restaurant) {
    const local = await this.getRestaurants();
    if (!local.find(r => r.id === restaurant.id)) {
      localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify([...local, restaurant]));
    }
    if (this.supabase) {
      await this.supabase.from('restaurants').upsert(restaurant);
    }
  }

  async saveReview(review: Review) {
    const local = await this.getReviews();
    const existingIndex = local.findIndex(r => r.id === review.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...local];
      updated[existingIndex] = review;
    } else {
      updated = [...local, review];
    }
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(updated));

    if (this.supabase) {
      await this.supabase.from('reviews').upsert(review);
    }
  }

  async deleteReview(reviewId: string) {
    const local = await this.getReviews();
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(local.filter(r => r.id !== reviewId)));

    if (this.supabase) {
      await this.supabase.from('reviews').delete().eq('id', reviewId);
    }
  }
}

export const db = new DBService();
