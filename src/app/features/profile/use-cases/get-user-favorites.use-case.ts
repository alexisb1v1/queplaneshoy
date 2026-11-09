import { ResultAsync } from 'neverthrow';
import { FavoritesRepository } from '../repositories/favorites.repository';
import { FavoriteEventModel } from '../models/favorite-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetUserFavoritesUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  execute(): ResultAsync<FavoriteEventModel[], DomainError> {
    return this.repository.getFavorites();
  }
}

