import { ResultAsync } from 'neverthrow';
import { FavoritesRepository } from '../repositories/favorites.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class RemoveFavoriteUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  execute(eventId: string): ResultAsync<{ message: string }, DomainError> {
    return this.repository.removeFavorite(eventId);
  }
}

