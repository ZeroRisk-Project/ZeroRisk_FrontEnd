import { useCallback, useEffect, useState } from 'react';
import {
    addFavorite,
    createGroup,
    getFavorites,
    getGroups,
    removeFavorite,
    type WatchlistFavoriteResponse,
} from '@/src/features/watchlist/api/watchlist';

const DEFAULT_GROUP_NAME = '기본';

async function resolveDefaultGroupId(): Promise<number> {
    const groups = await getGroups();
    if (groups.length > 0) {
        return groups[0].groupId;
    }
    const created = await createGroup(DEFAULT_GROUP_NAME);
    return created.groupId;
}

export function useWatchlist() {
    const [favorites, setFavorites] = useState<WatchlistFavoriteResponse[] | null>(null);

    useEffect(() => {
        let ignore = false;
        getFavorites()
            .then((data) => { if (!ignore) setFavorites(data); })
            .catch(() => { if (!ignore) setFavorites(null); });

        return () => {
            ignore = true;
        };
    }, []);

    const isFavorite = useCallback(
        (stockCode: string) => (favorites ?? []).some((favorite) => favorite.stockCode === stockCode),
        [favorites],
    );

    const toggleFavorite = useCallback(async (stockCode: string) => {
        const existing = (favorites ?? []).find((favorite) => favorite.stockCode === stockCode);
        try {
            if (existing) {
                await removeFavorite(existing.favoriteId);
            } else {
                const groupId = await resolveDefaultGroupId();
                await addFavorite(groupId, stockCode);
            }
            setFavorites(await getFavorites());
            return true;
        } catch {
            return false;
        }
    }, [favorites]);

    return { favorites, isFavorite, toggleFavorite };
}