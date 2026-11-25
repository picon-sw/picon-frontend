import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

// 온보딩 화면(/onboarding, /onboarding/:step)을 감싸는 라우트
export function OnboardingGate() {
  const { status, isOnboarded } = useAuth();
  const { pathname } = useLocation();
  const isLoginStep = pathname.replace(/\/$/, '') === '/onboarding';

  if (status === 'checking') return null;

  // 로그인 전에는 로그인 화면만 볼 수 있음
  if (status === 'signedOut') {
    return isLoginStep ? <Outlet /> : <Navigate to="/onboarding" replace />;
  }

  // 온보딩을 끝낸 사용자는 홈으로
  if (isOnboarded === true) return <Navigate to="/" replace />;

  // 로그인한 사용자가 로그인 화면에 오면 약관으로 (온보딩 여부를 모르면 홈으로)
  if (isLoginStep) {
    return <Navigate to={isOnboarded === false ? '/onboarding/terms' : '/'} replace />;
  }

  return <Outlet />;
}
