import { ResultAsync } from 'neverthrow';
import { FavoriteEventModel, ToggleFavoriteResult, UserFavoriteIdsResult } from '../models/favorite-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export abstract class FavoritesRepository {
  abstract toggleFavorite(eventId: string): ResultAsync<ToggleFavoriteResult, DomainError>;
  abstract getFavoriteIds(): ResultAsync<UserFavoriteIdsResult, DomainError>;
  abstract getFavorites(): ResultAsync<FavoriteEventModel[], DomainError>;
  abstract removeFavorite(eventId: string): ResultAsync<{ message: string }, DomainError>;
}

