import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { formatExpertPrice, getExpert } from '../api/experts';
import styles from './RequestExpertProfilePage.module.css';

export function RequestExpertProfilePage() {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // TODO: API 연동 시 id로 작가 정보 요청 (fetchExpert)
  const expert = getExpert(Number(expertId));

  // 전문가 선택 목록으로 돌아가기. 주소로 바로 들어온 경우(이전 화면 없음)는 목록 주소로
  const goBackToList = () => {
    if (location.key === 'default') navigate('/requests/new/experts');
    else navigate(-1);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBackToList}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>{expert ? expert.name : '작가 프로필'}</h1>
      </header>

      {expert ? (
        <div className={styles.content}>
          <section className={styles.profile}>
            <div className={styles.profileRow}>
              {expert.profileImageUrl ? (
                <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
              )}
              <div className={styles.info}>
                <p className={styles.name}>{expert.name}</p>
                <p className={styles.meta}>
                  ★ {expert.rating.toFixed(1)}&nbsp;&nbsp;후기 {expert.reviewCount} · 평균 전달{' '}
                  {expert.deliveryDays}일
                </p>
              </div>
            </div>
            <p className={styles.introduction}>{expert.introduction}</p>
          </section>

          <ul className={styles.portfolio} aria-label="포트폴리오">
            {expert.profilePortfolio.map(({ id, imageUrl }) => (
              <li
                key={id}
                className={
                  imageUrl ? styles.portfolioItem : `${styles.portfolioItem} ${styles.imageEmpty}`
                }
              >
                {imageUrl && <img src={imageUrl} alt="" />}
              </li>
            ))}
          </ul>

          <section className={styles.styleCard}>
            <h2 className={styles.cardTitle}>이렇게 촬영해요</h2>
            <ul className={styles.tags} aria-label="분위기">
              {expert.moodTags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  #{tag}
                </li>
              ))}
            </ul>
            <p className={styles.cardText}>{expert.shootingStyle}</p>
          </section>

          <section className={styles.priceCard} aria-label="견적">
            <p className={styles.priceSummary}>{formatExpertPrice(expert)}</p>
            <p className={styles.priceDetail}>촬영 1시간 · 원본·보정 1회 포함</p>
          </section>
        </div>
      ) : (
        <p className={styles.notFound}>작가 정보를 찾을 수 없어요.</p>
      )}

      <div className={styles.bottomBar}>
        <button type="button" className={styles.backButton} onClick={goBackToList}>
          목록으로 돌아가기
        </button>
      </div>
    </main>
  );
}
