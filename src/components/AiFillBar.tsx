import sparklesIcon from '../assets/icons/request/sparkles.svg';
import type { AiFillStatus } from '../hooks/useAiFill';
import styles from './AiFillBar.module.css';

interface AiFillBarProps {
  photoCount: number;
  status: AiFillStatus;
  onFill: () => void;
}

const MESSAGE: Record<AiFillStatus, string> = {
  idle: '사진 분위기로 요청 사항을 채워드릴게요',
  loading: '요청 사항을 만들고 있어요',
  done: '요청 사항에 채워 넣었어요',
  error: '채우지 못했어요. 다시 시도해 주세요',
};

const BUTTON_LABEL: Record<AiFillStatus, string> = {
  idle: '채우기',
  loading: '생성 중',
  done: '채움 완료',
  error: '다시 시도',
};

// 분위기 사진을 보고 요청 사항을 채워 주는 안내 바 (사진 1장 이상일 때만 표시)
export function AiFillBar({ photoCount, status, onFill }: AiFillBarProps) {
  return (
    <section className={styles.bar} aria-label="AI 요청 사항 채우기">
      <div className={styles.header}>
        <img src={sparklesIcon} alt="" />
        <p className={styles.title}>참고 사진 {photoCount}장을 확인했어요.</p>
      </div>
      <div className={styles.row}>
        <p className={styles.message} aria-live="polite">
          {MESSAGE[status]}
        </p>
        <button
          type="button"
          className={styles.fillButton}
          disabled={status === 'loading' || status === 'done'}
          aria-busy={status === 'loading'}
          onClick={onFill}
        >
          {BUTTON_LABEL[status]}
        </button>
      </div>
    </section>
  );
}
