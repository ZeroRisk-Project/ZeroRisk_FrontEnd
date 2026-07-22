import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
    withCredentials: true, // HttpOnly Cookie(accessToken/refreshToken) 전송 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// 서버 공통 에러 응답 포맷: { success, errorCode, message }
export interface ApiErrorResponse {
    success: false;
    errorCode: string;
    message: string;
}

let isRefreshing = false;
let refreshWaiters: Array<() => void> = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/reissue') {
            if (isRefreshing) {
                await new Promise<void>((resolve) => refreshWaiters.push(resolve));
                return api(originalRequest);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/reissue');
                refreshWaiters.forEach((resolve) => resolve());
                refreshWaiters = [];
                return api(originalRequest);
            } catch (reissueError) {
                refreshWaiters = [];
                window.location.href = '/login';
                return Promise.reject(reissueError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;