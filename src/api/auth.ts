import { clearSession, getAuthState } from './authStore';
import { refreshAccessToken } from './client';

// 카카오 로그인 콜백 경로 (카카오 콘솔과 백엔드 허용 목록에 등록된 주소)
export const KAKAO_CALLBACK_PATH = '/oauth/kakao/callback';

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
