import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';

// 로그인이 필요한 화면을 감싸는 라우트
// 로그인 안 함 → 로그인 화면, 온보딩 안 끝냄 → 약관 화면
export function RequireAuth() {
  const { status, isOnboarded } = useAuth();

  // 새로고침 직후 재발급 결과를 기다리는 동안은 아무것도 그리지 않음
  if (status === 'checking') return null;
  if (status === 'signedOut') return <Navigate to="/onboarding" replace />;
  if (isOnboarded === false) return <Navigate to="/onboarding/terms" replace />;

  return <Outlet />;
}
