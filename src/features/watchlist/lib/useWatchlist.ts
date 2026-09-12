import { useCallback, useEffect, useRef, useState } from 'react';
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

export function useWatchlist(enabled = true) {
    const [groups, setGroups] = useState<WatchlistGroupResponse[]>([]);
    const [favorites, setFavorites] = useState<WatchlistFavoriteResponse[] | null>(null);

    const reload = useCallback(async () => {
        if (!enabled) return;
        const [nextGroups, nextFavorites] = await Promise.all([getGroups(), getFavorites()]);
        setGroups(nextGroups);
        setFavorites(nextFavorites);
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            setGroups([]);
            setFavorites(null);
            return;
        }

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
    }, [enabled]);

    // 즐겨찾기를 아주 짧은 간격으로 두 번 누르면(더블클릭 등) 두 호출이 모두 "그룹 없음"으로 보고
    // 각자 기본 그룹을 만들어버릴 수 있다 - 진행 중인 resolve를 공유해서 동시 호출이 하나의
    // 결과를 기다리게 한다.
    const resolvingDefaultGroupRef = useRef<Promise<number> | null>(null);

    const resolveDefaultGroupId = useCallback(async () => {
        if (resolvingDefaultGroupRef.current) {
            return resolvingDefaultGroupRef.current;
        }

        const resolution = (async () => {
            const loaded = groups.length > 0 ? groups : await getGroups();
            if (loaded.length > 0) {
                setGroups(loaded);
                return loaded[0].groupId;
            }
            const created = await createGroup(DEFAULT_GROUP_NAME);
            setGroups([created]);
            return created.groupId;
        })();

        resolvingDefaultGroupRef.current = resolution;
        try {
            return await resolution;
        } finally {
            resolvingDefaultGroupRef.current = null;
        }
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

    // 즐겨찾기 추가 시 그룹을 직접 골라야 할 때(관심종목 추가 다이얼로그) 사용 - 이미
    // 즐겨찾기된 종목이면 아무 것도 하지 않는다(토글은 toggleFavorite가 담당).
    const addFavoriteToGroup = useCallback(async (stockCode: string, groupId: number) => {
        try {
            await addFavorite(groupId, stockCode);
            setFavorites(await getFavorites());
            return true;
        } catch {
            return false;
        }
    }, []);

    // 관심종목 추가 다이얼로그에서 "새 그룹 만들기"로 즉시 그 그룹에 담을 수 있도록,
    // 생성된 그룹의 id를 그대로 반환한다.
    const createGroupReturningId = useCallback(async (name: string) => {
        try {
            const created = await createGroup(name);
            await reload();
            return created.groupId;
        } catch {
            return null;
        }
    }, [reload]);

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
        addFavoriteToGroup,
        createGroupReturningId,
        addGroup,
        renameGroup,
        removeGroup,
        changeFavoriteGroup,
    };
}