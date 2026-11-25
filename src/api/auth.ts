import { clearSession, getAuthState, setSession } from './authStore';
import { client, refreshAccessToken, type ApiResponse } from './client';

// 카카오 로그인 콜백 경로 (카카오 콘솔과 백엔드 허용 목록에 등록된 주소)
export const KAKAO_CALLBACK_PATH = '/oauth/kakao/callback';

// 인가 요청에 붙인 state를 콜백에서 비교하려고 잠시 보관 (토큰이 아니라 sessionStorage 사용)
const KAKAO_STATE_KEY = 'kakaoOAuthState';

// 인가 요청과 로그인 API에 같은 값을 보내야 함 (로컬·운영 주소를 자동으로 사용)
function kakaoRedirectUri() {
  return `${window.location.origin}${KAKAO_CALLBACK_PATH}`;
}

// 카카오 로그인 화면으로 이동
export function startKakaoLogin() {
  // 카카오 client_id는 인가 URL에 공개되는 식별자라 VITE_*로 둠 (Secret은 백엔드에만 있음)
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_KAKAO_CLIENT_ID가 설정되지 않았습니다.');
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem(KAKAO_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: kakaoRedirectUri(),
    response_type: 'code',
    state,
  });
  window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params}`);
}

// 콜백으로 돌아온 state가 인가 요청 때 값과 같은지 확인. 한 번 확인하면 지움
export function checkKakaoState(state: string | null) {
  const saved = sessionStorage.getItem(KAKAO_STATE_KEY);
  sessionStorage.removeItem(KAKAO_STATE_KEY);
  return saved !== null && state === saved;
}

interface LoginResult {
  accessToken: string;
  expiresIn: number;
  isNewMember: boolean;
  isOnboarded: boolean;
}

// 인가 코드로 로그인. Refresh Token은 응답 쿠키로 저장됨
export async function loginWithKakao(code: string): Promise<LoginResult> {
  const { data } = await client.post<ApiResponse<LoginResult>>('/auth/kakao', {
    code,
    redirectUri: kakaoRedirectUri(),
  });
  if (!data.result) throw new Error('로그인 응답에 토큰이 없습니다.');
  setSession(data.result.accessToken, data.result.isOnboarded);
  return data.result;
}

// 서버 세션을 끝내고 쿠키를 지움. 요청이 실패해도 이 기기에서는 로그아웃
export async function logout() {
  try {
    await client.post('/auth/logout');
  } finally {
    clearSession();
  }
}

let restoring = false;

// 앱 시작(새로고침) 시 쿠키의 Refresh Token으로 Access Token을 다시 받음
// StrictMode에서 두 번 불려도 한 번만 실행
export function restoreSession() {
  if (restoring) return;
  restoring = true;

  // 콜백 화면은 카카오 로그인으로 새 세션을 만들기 때문에 재발급하지 않음
  if (window.location.pathname === KAKAO_CALLBACK_PATH) return;

  refreshAccessToken().catch(() => {
    // 401 외의 실패(네트워크 등)도 로그인 화면으로 보냄. 그사이 로그인했다면 유지
    if (getAuthState().status === 'checking') clearSession();
  });
}
