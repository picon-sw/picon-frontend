import styles from './FilterChips.module.css';

interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  count: number;
}

interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // 오른쪽 끝 정렬 문구 (예: 최신순)
  sortLabel: string;
}

// "전체 6 · 진행 중 3 · 완료 3" 같은 필터 칩 + 오른쪽 정렬 문구
// TODO: 정렬 기준이 여러 개가 되면 정렬 문구를 SortDropdown으로 교체
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  sortLabel,
}: FilterChipsProps<T>) {
  return (
    <div className={styles.row}>
      <div className={styles.chips}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            className={value === option.value ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => onChange(option.value)}
          >
            {option.label} {option.count}
          </button>
        ))}
      </div>
      <span className={styles.sort}>{sortLabel}</span>
    </div>
  );
}
