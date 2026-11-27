import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { logout } from '../api/auth';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import { PageHeader } from '../components/PageHeader';
import styles from './MySettingsPage.module.css';

// to가 없는 메뉴는 아직 화면이 없어 버튼만 표시
const SETTING_ITEMS: { label: string; to?: string }[] = [
  { label: '알림 설정', to: '/my/settings/notifications' },
  { label: '공지사항', to: '/my/settings/notices' },
  { label: '자주 묻는 질문', to: '/my/settings/faq' },
  { label: '고객센터', to: '/my/settings/support' },
  { label: '약관 및 정책', to: '/my/settings/terms' },
];

export function MySettingsPage() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    // 요청이 실패해도 이 기기에서는 로그아웃 처리됨
    await logout().catch(() => undefined);
    navigate('/onboarding', { replace: true });
  }

  return (
    <main className={styles.page}>
      <PageHeader title="설정 및 지원" backTo="/my" />

      <ul className={styles.list}>
        {SETTING_ITEMS.map(({ label, to }) => (
          <li key={label}>
            {to ? (
              <Link to={to} className={styles.item}>
                <span>{label}</span>
                <img src={chevronRightIcon} alt="" />
              </Link>
            ) : (
              <button type="button" className={styles.item}>
                <span>{label}</span>
                <img src={chevronRightIcon} alt="" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`${styles.item} ${styles.logout}`}
        onClick={handleLogout}
        disabled={loggingOut}
      >
        로그아웃
      </button>
    </main>
  );
}
