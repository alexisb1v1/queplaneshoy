import { ResultAsync } from 'neverthrow';
import { FavoritesRepository } from '../repositories/favorites.repository';
import { ToggleFavoriteResult } from '../models/favorite-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class ToggleFavoriteUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  execute(eventId: string): ResultAsync<ToggleFavoriteResult, DomainError> {
    return this.repository.toggleFavorite(eventId);
  }
}

