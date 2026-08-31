import { useCallback, useEffect, useState } from 'react';
import {
    addFavorite,
    createGroup,
    deleteGroup,
    getFavorites,
    getGroups,
    moveFavorite,
    removeFavorite,
    updateGroup,
    type WatchlistFavoriteResponse,
    type WatchlistGroupResponse,
} from '@/src/features/watchlist/api/watchlist';

const DEFAULT_GROUP_NAME = '기본';

export function useWatchlist() {
    const [groups, setGroups] = useState<WatchlistGroupResponse[]>([]);
    const [favorites, setFavorites] = useState<WatchlistFavoriteResponse[] | null>(null);

    const reload = useCallback(async () => {
        const [nextGroups, nextFavorites] = await Promise.all([getGroups(), getFavorites()]);
        setGroups(nextGroups);
        setFavorites(nextFavorites);
    }, []);

    useEffect(() => {
        let ignore = false;
        Promise.all([getGroups(), getFavorites()])
            .then(([nextGroups, nextFavorites]) => {
                if (ignore) return;
                setGroups(nextGroups);
                setFavorites(nextFavorites);
            })
            .catch(() => {
                if (ignore) return;
                setGroups([]);
                setFavorites(null);
            });

        return () => {
            ignore = true;
        };
    }, []);

    const resolveDefaultGroupId = useCallback(async () => {
        const loaded = groups.length > 0 ? groups : await getGroups();
        if (loaded.length > 0) {
            setGroups(loaded);
            return loaded[0].groupId;
        }
        const created = await createGroup(DEFAULT_GROUP_NAME);
        setGroups([created]);
        return created.groupId;
    }, [groups]);

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
                await addFavorite(await resolveDefaultGroupId(), stockCode);
            }
            setFavorites(await getFavorites());
            return true;
        } catch {
            return false;
        }
    }, [favorites, resolveDefaultGroupId]);

    const addGroup = useCallback(async (name: string) => {
        try {
            await createGroup(name);
            await reload();
            return true;
        } catch {
            return false;
        }
    }, [reload]);

    const renameGroup = useCallback(async (groupId: number, name: string) => {
        try {
            await updateGroup(groupId, name);
            await reload();
            return true;
        } catch {
            return false;
        }
    }, [reload]);

    const removeGroup = useCallback(async (groupId: number) => {
        try {
            await deleteGroup(groupId);
            await reload();
            return true;
        } catch {
            return false;
        }
    }, [reload]);

    const changeFavoriteGroup = useCallback(async (favoriteId: number, groupId: number) => {
        try {
            await moveFavorite(favoriteId, groupId);
            await reload();
            return true;
        } catch {
            return false;
        }
    }, [reload]);

    return {
        groups,
        favorites,
        isFavorite,
        toggleFavorite,
        addGroup,
        renameGroup,
        removeGroup,
        changeFavoriteGroup,
    };
}