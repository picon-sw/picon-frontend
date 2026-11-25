import { formatExpertSummary, type Expert } from '../api/experts';
import styles from './DirectExpertBanner.module.css';

interface DirectExpertBannerProps {
  expert: Expert;
  // 없으면 'OO에게 바로 요청해요' / 작가 지역·금액 요약
  title?: string;
  text?: string;
}

// 작가 프로필에서 바로 의뢰할 때 요청서 위에 보이는 안내
export function DirectExpertBanner({ expert, title, text }: DirectExpertBannerProps) {
  return (
    <section className={styles.banner} aria-label="요청할 작가">
      {expert.profileImageUrl ? (
        <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
      ) : (
        <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
      )}
      <div className={styles.info}>
        <p className={styles.title}>{title ?? `${expert.name}에게 바로 요청해요`}</p>
        <p className={styles.text}>{text ?? formatExpertSummary(expert)}</p>
      </div>
    </section>
  );
}
