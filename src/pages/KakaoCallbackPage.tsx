import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { checkKakaoState, loginWithKakao } from '../api/auth';
import { clearSession } from '../api/authStore';
import styles from './KakaoCallbackPage.module.css';

// 카카오 로그인 후 돌아오는 화면 (/oauth/kakao/callback?code=...&state=...)
export function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [failed, setFailed] = useState(false);
  // 인가 코드는 한 번만 쓸 수 있어서 StrictMode에서 effect가 두 번 실행돼도 한 번만 요청
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get('code');
    const stateMatched = checkKakaoState(searchParams.get('state'));

    // 사용자가 카카오 동의 화면에서 취소함
    if (searchParams.get('error') === 'access_denied') {
      clearSession();
      navigate('/onboarding', { replace: true });
      return;
    }

    // 코드가 없거나 state가 다르면(다른 곳에서 만든 요청) 로그인하지 않음
    const login =
      code && stateMatched
        ? loginWithKakao(code)
        : Promise.reject(new Error('카카오 로그인 state가 일치하지 않습니다.'));

    login
      .then(({ isOnboarded }) => {
        navigate(isOnboarded ? '/' : '/onboarding/terms', { replace: true });
      })
      .catch(() => {
        clearSession();
        setFailed(true);
      });
  }, [navigate, searchParams]);

  return (
    <main className={styles.page}>
      {failed ? (
        <>
          <p className={styles.message}>카카오 로그인에 실패했어요.</p>
          <Link to="/onboarding" replace className={styles.retry}>
            다시 로그인하기
          </Link>
        </>
      ) : (
        <p className={styles.message}>로그인 중이에요...</p>
      )}
    </main>
  );
}
