import { useEffect, type ReactNode } from 'react';
import styles from './ActionSheet.module.css';

export interface ActionSheetButton {
  label: string;
  onClick: () => void;
  // primary: 파란 실행 버튼(오른쪽) / secondary: 흰 보조 버튼(왼쪽)
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

interface ActionSheetProps {
  title: string;
  description?: ReactNode;
  // 연한 파란 상자 안내 (비용·환불 등)
  info?: ReactNode;
  children?: ReactNode;
  buttons: ActionSheetButton[];
  onClose: () => void;
}

// 확인·입력 시트 (Figma 공통 규칙: 제목 20 굵게, 본문 13, 아래 버튼 바 고정)
// 시트 높이는 내용에 맞춤. 바깥(어두운 영역) 클릭 또는 Esc로 닫힘
export function ActionSheet({
  title,
  description,
  info,
  children,
  buttons,
  onClose,
}: ActionSheetProps) {
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
        <div className={styles.body}>
          <div className={styles.handle} aria-hidden="true" />
          <div className={styles.heading}>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {info && <p className={styles.info}>{info}</p>}
          {children}
        </div>

        <div className={styles.buttonBar}>
          {buttons.map(({ label, onClick, variant = 'primary', disabled }) => (
            <button
              key={label}
              type="button"
              className={variant === 'primary' ? styles.primary : styles.secondary}
              disabled={disabled}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
