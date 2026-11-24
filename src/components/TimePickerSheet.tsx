import { useState } from 'react';
import { TIME_SLOTS } from '../constants/requestOptions';
import { formatMonthDay } from '../utils/date';
import { BottomSheet } from './BottomSheet';
import dateStyles from './DatePickerSheet.module.css';
import styles from './TimePickerSheet.module.css';

interface TimePickerSheetProps {
  // 'YYYY-MM-DD' (안내 문구와 요약에 표시)
  date: string;
  // 'HH:mm'
  value: string | null;
  // 고를 수 있는 시간만 넘기면 나머지는 비활성 (없으면 전부 가능)
  availableTimes?: readonly string[];
  onSelect: (time: string) => void;
  onClose: () => void;
}

const MORNING = TIME_SLOTS.filter((time) => time < '12:00');
const AFTERNOON = TIME_SLOTS.filter((time) => time >= '12:00');

// 희망 시간 바텀시트. 30분 단위, 오전/오후로 나눠 보여 줌
export function TimePickerSheet({
  date,
  value,
  availableTimes,
  onSelect,
  onClose,
}: TimePickerSheetProps) {
  const isAvailable = (time: string) => !availableTimes || availableTimes.includes(time);
  const [selected, setSelected] = useState<string | null>(
    value && isAvailable(value) ? value : null,
  );

  const renderGroup = (label: string, times: string[]) => (
    <div className={styles.group} role="group" aria-label={label}>
      <p className={styles.groupLabel}>{label}</p>
      <div className={styles.chips}>
        {times.map((time) => {
          const isSelected = time === selected;
          return (
            <button
              key={time}
              type="button"
              className={isSelected ? `${styles.chip} ${styles.chipSelected}` : styles.chip}
              disabled={!isAvailable(time)}
              aria-pressed={isSelected}
              onClick={() => setSelected(time)}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <BottomSheet title="희망 시간" onClose={onClose}>
      <p className={dateStyles.guide}>{formatMonthDay(date)} · 30분 단위로 고를 수 있어요</p>

      <div className={styles.groups}>
        {renderGroup('오전', MORNING)}
        {renderGroup('오후', AFTERNOON)}
      </div>

      <div className={dateStyles.footer}>
        <p className={dateStyles.summary}>
          <span className={dateStyles.summaryLabel}>선택한 시간</span>
          <span className={selected ? dateStyles.summaryValue : dateStyles.summaryEmpty}>
            {selected ? `${formatMonthDay(date)} ${selected}` : '시간을 골라 주세요'}
          </span>
        </p>
        <button
          type="button"
          className={dateStyles.confirm}
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          이 시간으로 선택하기
        </button>
      </div>
    </BottomSheet>
  );
}
