import { PageHeader } from '../components/PageHeader';
import styles from './MySupportPage.module.css';

// TODO: 실제 운영 전 고객센터 번호 · 운영 시간 확정 후 수정 (지금은 임시 번호)
const SUPPORT_PHONE = '010-1234-5678';
const SUPPORT_HOURS = [
  { label: '평일', value: '10:00 ~ 18:00' },
  { label: '점심시간', value: '12:00 ~ 13:00' },
  { label: '주말 · 공휴일', value: '휴무' },
];

// 고객센터 연락처 (설정 및 지원 → 고객센터)
export function MySupportPage() {
  return (
    <main className={styles.page}>
      <PageHeader title="고객센터" backTo="/my/settings" />

      <section className={styles.contact} aria-labelledby="contact-title">
        <h2 id="contact-title" className={styles.contactTitle}>
          전화 상담
        </h2>
        <p className={styles.phone}>{SUPPORT_PHONE}</p>
        <dl className={styles.hours}>
          {SUPPORT_HOURS.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <a className={styles.callButton} href={`tel:${SUPPORT_PHONE.replaceAll('-', '')}`}>
          전화하기
        </a>
      </section>
    </main>
  );
}
