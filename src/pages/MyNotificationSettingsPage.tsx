import { useState } from 'react';
import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import styles from './MyNotificationSettingsPage.module.css';

type NotificationKey = 'request' | 'contest' | 'favorite' | 'marketing' | 'marketingNight';

interface NotificationItem {
  key: NotificationKey;
  label: string;
  description: string;
}

const ACTIVITY_ITEMS: NotificationItem[] = [
  { key: 'request', label: '의뢰 알림', description: '견적·제안 도착, 일정 확정, 결과물 도착' },
  { key: 'contest', label: '콘테스트 알림', description: '새 콘테스트, 투표 마감, 결과 발표' },
  { key: 'favorite', label: '관심 작가 알림', description: '찜한 작가의 새 포트폴리오' },
];

const MARKETING_ITEMS: NotificationItem[] = [
  { key: 'marketing', label: '혜택·이벤트 알림', description: '할인, 이벤트, 새 기능 소식' },
  {
    key: 'marketingNight',
    label: '야간 혜택 알림',
    description: '밤 9시 ~ 아침 8시에도 혜택 알림 받기',
  },
];

// 광고성 알림(혜택·이벤트)은 사용자가 직접 켜야 해서 기본값은 꺼짐
// TODO: API 연동 시 서버에 저장된 설정으로 교체
const INITIAL_SETTINGS: Record<NotificationKey, boolean> = {
  request: true,
  contest: true,
  favorite: true,
  marketing: false,
  marketingNight: false,
};

interface ToggleProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, checked, disabled = false, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={checked ? `${styles.toggle} ${styles.toggleOn}` : styles.toggle}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

interface SettingRowProps {
  item: NotificationItem;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function SettingRow({ item, checked, disabled, onChange }: SettingRowProps) {
  return (
    <li className={disabled ? `${styles.row} ${styles.rowDisabled}` : styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{item.label}</span>
        <span className={styles.rowDescription}>{item.description}</span>
      </div>
      <Toggle label={item.label} checked={checked} disabled={disabled} onChange={onChange} />
    </li>
  );
}

export function MyNotificationSettingsPage() {
  // 전체 알림을 꺼도 각 알림 값은 기억해 두고, 다시 켜면 그대로 돌아옴
  const [allEnabled, setAllEnabled] = useState(true);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // TODO: API 연동 시 바뀐 값을 서버에 저장
  const updateSetting = (key: NotificationKey, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: checked,
      // 혜택 알림을 끄면 야간 혜택 알림도 함께 꺼짐
      ...(key === 'marketing' && !checked ? { marketingNight: false } : {}),
    }));
  };

  const isDisabled = (key: NotificationKey) =>
    !allEnabled || (key === 'marketingNight' && !settings.marketing);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my/settings" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>알림 설정</h1>
      </header>

      <div className={styles.allRow}>
        <span className={styles.allLabel}>전체 알림</span>
        <Toggle label="전체 알림" checked={allEnabled} onChange={setAllEnabled} />
      </div>

      <section aria-labelledby="activity-title">
        <h2 id="activity-title" className={styles.sectionTitle}>
          활동 알림
        </h2>
        <ul className={styles.list}>
          {ACTIVITY_ITEMS.map((item) => (
            <SettingRow
              key={item.key}
              item={item}
              checked={settings[item.key]}
              disabled={isDisabled(item.key)}
              onChange={(checked) => updateSetting(item.key, checked)}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="marketing-title">
        <h2 id="marketing-title" className={styles.sectionTitle}>
          혜택 알림
        </h2>
        <ul className={styles.list}>
          {MARKETING_ITEMS.map((item) => (
            <SettingRow
              key={item.key}
              item={item}
              checked={settings[item.key]}
              disabled={isDisabled(item.key)}
              onChange={(checked) => updateSetting(item.key, checked)}
            />
          ))}
        </ul>
        <p className={styles.notice}>
          혜택·이벤트 알림은 동의한 경우에만 보내드려요. 언제든지 끌 수 있어요.
        </p>
      </section>
    </main>
  );
}
