import axios, { type InternalAxiosRequestConfig } from 'axios';
import { clearSession, getAccessToken, setSession } from './authStore';

// 백엔드 공통 응답 형식. 실패하면 result 없이 isSuccess, code, message만 옴
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T;
}

// 모든 API 요청은 이 client 사용 (baseURL: /api)
// S3 Pre-signed URL 업로드는 client 말고 fetch 사용
export const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// 로그인·재발급·로그아웃은 Access Token 없이 호출하고, 401이어도 재발급하지 않음
function isAuthRequest(url?: string) {
  return url?.startsWith('/auth/') ?? false;
}

interface TokenRefreshResult {
  accessToken: string;
  expiresIn: number;
  // TODO: 백엔드가 재발급 응답에 추가하면 사용 (새로고침 후 온보딩 여부 확인)
  isOnboarded?: boolean;
}

// 진행 중인 재발급. 동시에 여러 번 불러도 요청은 한 번만 보냄
// (재발급할 때마다 Refresh Token이 바뀌어서, 여러 번 보내면 첫 번째만 성공함)
let refreshing: Promise<void> | null = null;

export function refreshAccessToken(): Promise<void> {
  refreshing ??= requestRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function requestRefresh() {
  const tokenAtStart = getAccessToken();
  try {
    const { data } = await client.post<ApiResponse<TokenRefreshResult>>('/auth/refresh');
    if (!data.result) throw new Error('재발급 응답에 토큰이 없습니다.');
    setSession(data.result.accessToken, data.result.isOnboarded);
  } catch (error) {
    // 401이면 다시 로그인해야 함. 그사이 새로 로그인했다면 그 세션은 지우지 않음
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      getAccessToken() === tokenAtStart
    ) {
      clearSession();
    }
    throw error;
  }
}

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !isAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  // 재발급 후 한 번 다시 보낸 요청인지
  retried?: boolean;
}

// 401이면 재발급 후 원래 요청을 한 번만 다시 보냄
// 재발급도 401이면 clearSession()으로 로그아웃 상태가 되고, 라우트 가드가 로그인 화면으로 보냄
client.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }

  const config: RetryConfig = error.config;
  if (isAuthRequest(config.url) || config.retried) throw error;
  config.retried = true;

  // 이 요청이 나간 뒤 다른 요청이 이미 재발급했다면 새 토큰으로 다시 보내기만 함
  const current = getAccessToken();
  if (!current || config.headers.Authorization === `Bearer ${current}`) {
    try {
      await refreshAccessToken();
    } catch {
      throw error;
    }
  }

  return client(config);
});
