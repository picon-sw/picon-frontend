import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import checkIcon from '../assets/icons/request/check-large.svg';
import { formatExpertPrice, getExpert } from '../api/experts';
import { formatLocation } from '../api/places';
import {
  daysUntil,
  fetchShootRequest,
  formatDeposit,
  type ShootRequestDetail,
} from '../api/proposals';
import { formatShootSchedule } from '../api/requests';
import styles from './RequestReservedPage.module.css';

// 예약금 결제 후 예약 완료 (뒤로 가기 없음: 견적서로 돌아가지 않게)
export function RequestReservedPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchShootRequest(Number(requestId)).then((result) => {
      if (!ignore) setDetail(result);
    });
    return () => {
      ignore = true;
    };
  }, [requestId]);

  const expert =
    detail?.phase === 'reserved' && detail.reservedExpertId
      ? getExpert(detail.reservedExpertId)
      : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>예약 완료</h1>
      </header>

      {detail && expert ? (
        <div className={styles.content}>
          <section className={styles.hero}>
            <img src={checkIcon} alt="" />
            <h2 className={styles.heroTitle}>예약이 확정됐어요</h2>
            <p className={styles.heroText}>{expert.name}와 함께할 순간을 기대해 주세요.</p>
          </section>

          <section className={`${styles.card} ${styles.cardHighlighted}`} aria-label="예약 정보">
            <div className={styles.cardTop}>
              <span className={styles.badge}>예약 확정</span>
              <span className={styles.dDay}>촬영 D-{daysUntil(detail.form.date)}</span>
            </div>
            <p className={styles.cardTitle}>{detail.title}</p>
            <p className={styles.cardMeta}>
              {formatShootSchedule(detail.form.date, detail.form.time)} ·{' '}
              {formatLocation(detail.form.location)} · {detail.form.people}명
            </p>
            <hr className={styles.divider} />
            <div className={styles.expert}>
              {expert.profileImageUrl ? (
                <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
              )}
              <div className={styles.expertInfo}>
                <p className={styles.expertName}>{expert.name}</p>
                <p className={styles.expertMessage}>일정이 확정되었어요.</p>
              </div>
            </div>
          </section>

          <section className={styles.card} aria-label="결제 정보">
            <p className={styles.priceSummary}>{formatExpertPrice(expert)}</p>
            <p className={styles.priceText}>촬영 1시간 · 원본·보정 1회 포함</p>
            <p className={styles.priceText}>예약금 {formatDeposit(expert)} 결제 완료</p>
          </section>
        </div>
      ) : (
        detail && <p className={styles.notFound}>예약 정보를 찾을 수 없어요.</p>
      )}

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate('/requests', { replace: true })}
        >
          의뢰 목록으로
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate(`/requests/${requestId}/reservation`, { replace: true })}
        >
          예약 상세 보기
        </button>
      </div>
    </main>
  );
}
