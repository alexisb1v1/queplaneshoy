import { FavoritesRepositoryImpl } from './repositories/favorites.repository.impl';
import { ToggleFavoriteUseCase } from './use-cases/toggle-favorite.use-case';
import { GetUserFavoriteIdsUseCase } from './use-cases/get-user-favorite-ids.use-case';
import { GetUserFavoritesUseCase } from './use-cases/get-user-favorites.use-case';
import { RemoveFavoriteUseCase } from './use-cases/remove-favorite.use-case';

const favoritesRepository = new FavoritesRepositoryImpl();

export const toggleFavoriteUseCase = new ToggleFavoriteUseCase(favoritesRepository);
export const getUserFavoriteIdsUseCase = new GetUserFavoriteIdsUseCase(favoritesRepository);
export const getUserFavoritesUseCase = new GetUserFavoritesUseCase(favoritesRepository);
export const removeFavoriteUseCase = new RemoveFavoriteUseCase(favoritesRepository);

export * from './models/favorite-event.model';
export * from './repositories/favorites.repository';

