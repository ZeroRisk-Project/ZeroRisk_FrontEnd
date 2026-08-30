import api from '@/src/shared/lib/api';

export interface WatchlistGroupResponse {
    groupId: number;
    name: string;
    createdAt: string;
}

export interface WatchlistFavoriteResponse {
    favoriteId: number;
    groupId: number;
    stockCode: string;
    stockName: string;
    createdAt: string;
}

export async function getGroups(): Promise<WatchlistGroupResponse[]> {
    const response = await api.get<WatchlistGroupResponse[]>('/watchlist/groups');
    return response.data;
}

export async function createGroup(name: string): Promise<WatchlistGroupResponse> {
    const response = await api.post<WatchlistGroupResponse>('/watchlist/groups', { name });
    return response.data;
}

export async function getFavorites(groupId?: number): Promise<WatchlistFavoriteResponse[]> {
    const response = await api.get<WatchlistFavoriteResponse[]>('/watchlist/favorites', {
        params: { groupId },
    });
    return response.data;
}

export async function addFavorite(groupId: number, stockCode: string): Promise<WatchlistFavoriteResponse> {
    const response = await api.post<WatchlistFavoriteResponse>('/watchlist/favorites', {
        groupId,
        stockCode,
    });
    return response.data;
}

export async function removeFavorite(favoriteId: number): Promise<void> {
    await api.delete(`/watchlist/favorites/${favoriteId}`);
}