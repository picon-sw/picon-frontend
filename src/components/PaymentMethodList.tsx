import radioOffIcon from '../assets/icons/request/radio-off.svg';
import radioOnIcon from '../assets/icons/request/radio-on.svg';
import { PAYMENT_METHODS, type PaymentMethod } from '../api/proposals';
import styles from './PaymentMethodList.module.css';

interface PaymentMethodListProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

// 결제 수단 고르기 (예약금 결제 · 사진 구매 공통)
export function PaymentMethodList({ value, onChange }: PaymentMethodListProps) {
  return (
    <div className={styles.methods} role="radiogroup" aria-label="결제 수단">
      {PAYMENT_METHODS.map((item) => {
        const selected = item === value;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? `${styles.method} ${styles.methodSelected}` : styles.method}
            onClick={() => onChange(item)}
          >
            <img src={selected ? radioOnIcon : radioOffIcon} alt="" />
            {item}
          </button>
        );
      })}
    </div>
  );
}
