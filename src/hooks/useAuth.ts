import { useSyncExternalStore } from 'react';
import { getAuthState, subscribeAuth } from '../api/authStore';

// 로그인 상태(checking / signedIn / signedOut)와 온보딩 완료 여부
export function useAuth() {
  return useSyncExternalStore(subscribeAuth, getAuthState);
}
