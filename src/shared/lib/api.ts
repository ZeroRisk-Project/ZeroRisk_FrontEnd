import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
    withCredentials: true, // HttpOnly Cookie(accessToken/refreshToken) 전송 필수
    headers: {
        'Content-Type': 'application/json',
    },
    maxRedirects: 0,
});

// 서버 공통 에러 응답 포맷: { success, errorCode, message }
export interface ApiErrorResponse {
    success: false;
    errorCode: string;
    message: string;
}

let isRefreshing = false;
let refreshWaiters: Array<{ resolve: () => void; reject: (error: unknown) => void }> = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const SILENT_CHECK_URLS = ['/users/me'];

        if (
            status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/reissue' &&
            !SILENT_CHECK_URLS.includes(originalRequest.url)
        ) {
            if (isRefreshing) {
                // resolve/reject를 둘 다 큐에 담아둬야, 재발급이 실패했을 때 대기 중인 요청들을
                // 정리(reject)할 수 있다 - 예전엔 실패 시 배열만 비우고 아무도 깨우지 않아서
                // 대기 중이던 요청들이 새로고침 전까지 영구히 멈춰 있었다.
                await new Promise<void>((resolve, reject) => refreshWaiters.push({ resolve, reject }));
                return api(originalRequest);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/reissue');
                refreshWaiters.forEach(({ resolve }) => resolve());
                refreshWaiters = [];
                return api(originalRequest);
            } catch (reissueError) {
                refreshWaiters.forEach(({ reject }) => reject(reissueError));
                refreshWaiters = [];
                const pathname = window.location.pathname;
                const isPublic =
                    pathname === '/' ||
                    pathname === '/stocks' ||
                    pathname.startsWith('/stocks/') ||
                    (pathname.startsWith('/community') && !pathname.startsWith('/community/write')) ||
                    pathname === '/ranking' ||
                    (pathname.startsWith('/competitions') && !pathname.startsWith('/competitions/create')) ||
                    pathname === '/about' ||
                    pathname === '/notice' ||
                    pathname === '/faq' ||
                    pathname === '/inquiry' ||
                    pathname === '/terms' ||
                    pathname === '/privacy' ||
                    pathname.startsWith('/users/') ||
                    pathname === '/login' ||
                    pathname === '/register' ||
                    pathname === '/forgot-password' ||
                    pathname.startsWith('/oauth2/');

                if (!isPublic) {
                    window.location.href = '/login';
                }
                return Promise.reject(reissueError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;