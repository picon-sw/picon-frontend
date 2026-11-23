// 로그인 상태 보관 (메모리에만 저장, localStorage·sessionStorage 사용 금지)
// Refresh Token은 HttpOnly 쿠키라 프론트에서 읽거나 저장하지 않음
export type AuthStatus = 'checking' | 'signedIn' | 'signedOut';

export interface AuthState {
  // checking: 앱 시작 후 재발급 결과를 기다리는 중
  status: AuthStatus;
  // 온보딩 완료 여부. 모르면 null (새로고침 후 재발급 응답에 값이 없을 때)
  isOnboarded: boolean | null;
}

let accessToken: string | null = null;
let state: AuthState = { status: 'checking', isOnboarded: null };
const listeners = new Set<() => void>();

function update(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function getAccessToken() {
  return accessToken;
}

export function getAuthState() {
  return state;
}

// React에서 상태 변화를 구독할 때 사용 (useSyncExternalStore)
export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 로그인·재발급 성공. isOnboarded를 모르면 이전 값을 유지
export function setSession(token: string, isOnboarded?: boolean) {
  accessToken = token;
  update({ status: 'signedIn', isOnboarded: isOnboarded ?? state.isOnboarded });
}

export function setOnboarded(isOnboarded: boolean) {
  update({ ...state, isOnboarded });
}

// 로그아웃, 재발급 실패
export function clearSession() {
  accessToken = null;
  update({ status: 'signedOut', isOnboarded: null });
}
