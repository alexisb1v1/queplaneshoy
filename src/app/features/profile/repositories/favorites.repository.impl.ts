import { ResultAsync } from 'neverthrow';
import { FavoritesRepository } from './favorites.repository';
import { FavoriteEventModel, ToggleFavoriteResult, UserFavoriteIdsResult } from '../models/favorite-event.model';
import { DomainError } from '../../../common/errors/domain-error';
import { apiClient } from '../../../common/services/api-client';

export class FavoritesRepositoryImpl implements FavoritesRepository {
  /**
   * Alterna un evento en la lista de favoritos del usuario autenticado
   */
  toggleFavorite(eventId: string): ResultAsync<ToggleFavoriteResult, DomainError> {
    return apiClient.requestResult<ToggleFavoriteResult>(
      apiClient.post(`/users/favorites/${encodeURIComponent(eventId)}/toggle`, {})
    );
  }

  /**
   * Obtiene la lista de IDs de todos los eventos favoritos del usuario
   */
  getFavoriteIds(): ResultAsync<UserFavoriteIdsResult, DomainError> {
    return apiClient.requestResult<UserFavoriteIdsResult>(
      apiClient.get('/users/favorites/ids')
    );
  }

  /**
   * Obtiene los eventos favoritos detallados para la pestaña Mis Favoritos
   */
  getFavorites(): ResultAsync<FavoriteEventModel[], DomainError> {
    return apiClient.requestResult<FavoriteEventModel[]>(
      apiClient.get('/users/favorites')
    );
  }

  /**
   * Quita un evento de favoritos
   */
  removeFavorite(eventId: string): ResultAsync<{ message: string }, DomainError> {
    return apiClient.requestResult<{ message: string }>(
      apiClient.delete(`/users/favorites/${encodeURIComponent(eventId)}`)
    );
  }
}

