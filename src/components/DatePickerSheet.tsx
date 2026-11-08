import { useState } from 'react';
import { WEEKDAY_LABELS, formatMonthDay, fromDateKey, toDateKey } from '../utils/date';
import { BottomSheet } from './BottomSheet';
import styles from './DatePickerSheet.module.css';

interface DatePickerSheetProps {
  title: string;
  // 'YYYY-MM-DD'
  value: string | null;
  minDate: string;
  maxDate: string;
  guide?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

// 달 비교용 숫자 (2026년 11월 → 2026 * 12 + 10)
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

// 월 달력 바텀시트. min~max 밖 날짜는 비활성, 범위 밖 달로는 이동 불가
export function DatePickerSheet({
  title,
  value,
  minDate,
  maxDate,
  guide,
  onSelect,
  onClose,
}: DatePickerSheetProps) {
  const min = fromDateKey(minDate);
  const max = fromDateKey(maxDate);
  // 이전에 고른 날짜가 범위를 벗어났으면 선택 안 한 것으로 봄
  const initial = value && value >= minDate && value <= maxDate ? value : null;
  const [selected, setSelected] = useState<string | null>(initial);
  const [view, setView] = useState(() => {
    const base = initial ? fromDateKey(initial) : min;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = view.getDay();
  const canPrev = monthIndex(view) > monthIndex(min);
  const canNext = monthIndex(view) < monthIndex(max);

  const moveMonth = (diff: number) => setView(new Date(year, month + diff, 1));

  return (
    <BottomSheet title={title} onClose={onClose}>
      {guide && <p className={styles.guide}>{guide}</p>}

      <div className={styles.monthNav}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="이전 달"
          disabled={!canPrev}
          onClick={() => moveMonth(-1)}
        >
          ‹
        </button>
        <span className={styles.monthLabel} aria-live="polite">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          className={styles.navButton}
          aria-label="다음 달"
          disabled={!canNext}
          onClick={() => moveMonth(1)}
        >
          ›
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={label}
            className={index === 0 ? `${styles.weekday} ${styles.sunday}` : styles.weekday}
            aria-hidden="true"
          >
            {label}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const key = toDateKey(new Date(year, month, day));
          const disabled = key < minDate || key > maxDate;
          const isSelected = key === selected;
          const className = [
            styles.day,
            (leadingBlanks + index) % 7 === 0 ? styles.sunday : '',
            isSelected ? styles.daySelected : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={key}
              type="button"
              className={className}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${year}년 ${month + 1}월 ${day}일`}
              onClick={() => setSelected(key)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <p className={styles.summary}>
          <span className={styles.summaryLabel}>선택한 날짜</span>
          <span className={selected ? styles.summaryValue : styles.summaryEmpty}>
            {selected ? formatMonthDay(selected) : '날짜를 골라 주세요'}
          </span>
        </p>
        <button
          type="button"
          className={styles.confirm}
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          이 날짜로 선택하기
        </button>
      </div>
    </BottomSheet>
  );
}
