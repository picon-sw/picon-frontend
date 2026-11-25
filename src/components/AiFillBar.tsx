import sparklesIcon from '../assets/icons/request/sparkles.svg';
import type { AiFillStatus } from '../hooks/useAiFill';
import styles from './AiFillBar.module.css';

interface AiFillBarProps {
  status: AiFillStatus;
  // 채우기 전 안내 (요청서마다 채우는 항목이 다름)
  idleMessage: string;
  onFill: () => void;
}

const MESSAGE: Record<Exclude<AiFillStatus, 'idle'>, string> = {
  loading: '요청서를 채우고 있어요',
  done: '요청서에 채워 넣었어요',
  error: '채우지 못했어요. 다시 시도해 주세요',
};

const BUTTON_LABEL: Record<AiFillStatus, string> = {
  idle: '채우기',
  loading: '생성 중',
  done: '채움 완료',
  error: '다시 시도',
};

// 참고 사진을 보고 요청서를 채워 주는 안내 바 (참고 사진을 올렸을 때만 표시)
export function AiFillBar({ status, idleMessage, onFill }: AiFillBarProps) {
  return (
    <section className={styles.bar} aria-label="AI 요청 사항 채우기">
      <div className={styles.header}>
        <img src={sparklesIcon} alt="" />
        <p className={styles.title}>참고 사진을 확인했어요.</p>
      </div>
      <div className={styles.row}>
        <p className={styles.message} aria-live="polite">
          {status === 'idle' ? idleMessage : MESSAGE[status]}
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
