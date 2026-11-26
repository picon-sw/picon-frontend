import styles from './SegmentTabs.module.css';

interface SegmentTabOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentTabsProps<T extends string> {
  tabs: SegmentTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // 화면 읽기 프로그램용 탭 묶음 이름 (예: "의뢰 종류")
  label: string;
}

// 반반 나뉜 탭 (고른 탭만 파란 2px 밑줄). Figma 마이페이지 나의 활동 상세 화면 공통
export function SegmentTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: SegmentTabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={value === tab.value ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
