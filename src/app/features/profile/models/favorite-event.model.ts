export interface FavoriteEventModel {
  id: string;
  publicUuid: string;
  slug: string;
  name: string;
  category: string;
  imageUrl: string;
  venue: string;
  city: string;
  nextShowDate: string | null;
  minPrice: number;
  favoritedAt: string;
}

export interface ToggleFavoriteResult {
  isFavorite: boolean;
  eventId: string;
  publicUuid?: string;
  message: string;
}

export interface UserFavoriteIdsResult {
  favoriteIds: string[];
  favoritePublicUuids: string[];
}

