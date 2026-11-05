import { useEffect, useRef, useState } from 'react';
import chevronDownIcon from '../assets/icons/explore/chevron-down.svg';
import styles from './SortDropdown.module.css';

interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

// 정렬 버튼 + 아래로 펼쳐지는 메뉴. 바깥을 누르면 닫힘
export function SortDropdown<T extends string>({
  options,
  value,
  onChange,
  label = '정렬',
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={open ? `${styles.button} ${styles.open}` : styles.button}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {options.find((option) => option.value === value)?.label}
        <img src={chevronDownIcon} alt="" />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={value === option.value}>
              <button
                type="button"
                className={
                  value === option.value ? `${styles.option} ${styles.selected}` : styles.option
                }
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
