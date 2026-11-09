import { ResultAsync } from 'neverthrow';
import { FavoritesRepository } from '../repositories/favorites.repository';
import { UserFavoriteIdsResult } from '../models/favorite-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetUserFavoriteIdsUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  execute(): ResultAsync<UserFavoriteIdsResult, DomainError> {
    return this.repository.getFavoriteIds();
  }
}

