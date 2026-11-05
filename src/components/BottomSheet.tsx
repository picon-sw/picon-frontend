import { useEffect, type ReactNode } from 'react';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// 화면 아래에서 올라오는 선택 창. 바깥(어두운 영역) 클릭 또는 Esc로 닫힘
export function BottomSheet({ title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <h2 className={styles.title}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
