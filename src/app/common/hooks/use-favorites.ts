'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api-client';
import { getUserFavoriteIdsUseCase, toggleFavoriteUseCase } from '../../features/profile';

const FAVORITES_EVENT_NAME = 'qph:favorites-updated';
const LOCAL_STORAGE_CACHE_KEY = 'qph_cached_favorite_ids';

let cachedIds: Set<string> = new Set();
let isFetched = false;

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return new Set(parsed);
        }
      } catch {
        // fallback
      }
    }
    return cachedIds;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar desde el backend
  const fetchFavorites = useCallback(async () => {
    const token = apiClient.getToken();
    if (!token) {
      cachedIds = new Set();
      setFavoriteIds(new Set());
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
      }
      return;
    }

    setIsLoading(true);
    const result = await getUserFavoriteIdsUseCase.execute();
    result.match(
      (data) => {
        const merged = new Set<string>();
        (data.favoriteIds || []).forEach((id) => merged.add(String(id)));
        (data.favoritePublicUuids || []).forEach((uuid) => merged.add(String(uuid)));

        cachedIds = merged;
        setFavoriteIds(new Set(merged));
        isFetched = true;
        setIsLoading(false);

        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(Array.from(merged)));
        }
      },
      () => {
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!isFetched && apiClient.getToken()) {
      fetchFavorites();
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ favoriteIds: string[] }>;
      if (customEvent.detail?.favoriteIds) {
        const nextSet = new Set(customEvent.detail.favoriteIds);
        cachedIds = nextSet;
        setFavoriteIds(nextSet);
      } else {
        // Si no vienen detalles, recargar
        fetchFavorites();
      }
    };

    window.addEventListener(FAVORITES_EVENT_NAME, handleUpdate);
    return () => {
      window.removeEventListener(FAVORITES_EVENT_NAME, handleUpdate);
    };
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (id?: string | null): boolean => {
      if (!id) return false;
      return favoriteIds.has(String(id));
    },
    [favoriteIds]
  );

  const toggle = useCallback(
    async (
      eventId: string,
      publicUuid?: string
    ): Promise<{ success: boolean; isFavorite: boolean; requiresAuth?: boolean }> => {
      const token = apiClient.getToken();
      if (!token) {
        return { success: false, isFavorite: false, requiresAuth: true };
      }

      // Optimistic update
      const key1 = String(eventId);
      const key2 = publicUuid ? String(publicUuid) : null;
      const currentlyFav = favoriteIds.has(key1) || (key2 ? favoriteIds.has(key2) : false);
      const nextFavState = !currentlyFav;

      const nextSet = new Set(favoriteIds);
      if (nextFavState) {
        nextSet.add(key1);
        if (key2) nextSet.add(key2);
      } else {
        nextSet.delete(key1);
        if (key2) nextSet.delete(key2);
      }

      cachedIds = nextSet;
      setFavoriteIds(nextSet);

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(Array.from(nextSet)));
        window.dispatchEvent(
          new CustomEvent(FAVORITES_EVENT_NAME, {
            detail: { favoriteIds: Array.from(nextSet) },
          })
        );
      }

      // Llamada real al backend
      const result = await toggleFavoriteUseCase.execute(eventId);

      return result.match(
        (data) => {
          // Confirmar estado retornado por backend
          const confirmedSet = new Set(nextSet);
          if (data.isFavorite) {
            confirmedSet.add(String(data.eventId));
            if (data.publicUuid) confirmedSet.add(String(data.publicUuid));
          } else {
            confirmedSet.delete(String(data.eventId));
            if (data.publicUuid) confirmedSet.delete(String(data.publicUuid));
          }
          cachedIds = confirmedSet;
          setFavoriteIds(confirmedSet);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(Array.from(confirmedSet)));
            window.dispatchEvent(
              new CustomEvent(FAVORITES_EVENT_NAME, {
                detail: { favoriteIds: Array.from(confirmedSet) },
              })
            );
          }
          return { success: true, isFavorite: data.isFavorite };
        },
        () => {
          // Rollback en caso de error
          cachedIds = favoriteIds;
          setFavoriteIds(favoriteIds);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(Array.from(favoriteIds)));
            window.dispatchEvent(
              new CustomEvent(FAVORITES_EVENT_NAME, {
                detail: { favoriteIds: Array.from(favoriteIds) },
              })
            );
          }
          return { success: false, isFavorite: currentlyFav };
        }
      );
    },
    [favoriteIds]
  );

  return {
    favoriteIds,
    isFavorite,
    toggle,
    fetchFavorites,
    isLoading,
  };
}

