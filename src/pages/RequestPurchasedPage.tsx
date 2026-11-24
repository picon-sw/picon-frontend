import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import checkIcon from '../assets/icons/request/check-large.svg';
import { formatWon, getExpert } from '../api/experts';
import {
  fetchShootRequest,
  formatArchiveUntil,
  getPhotoPrice,
  type ShootRequestDetail,
} from '../api/proposals';
import { formatShootSchedule } from '../api/requests';
import { formatMonthDay } from '../utils/date';
import styles from './RequestReservedPage.module.css';
import ownStyles from './RequestPurchasedPage.module.css';

// 사진 구매 완료 (뒤로 가기 없음: 구매 확인으로 돌아가지 않게)
// 예약 완료 화면과 같은 틀이라 RequestReservedPage 스타일을 같이 씀
export function RequestPurchasedPage() {
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

  const purchase = detail?.phase === 'purchased' ? detail.purchase : undefined;
  const expert = purchase && detail?.reservedExpertId ? getExpert(detail.reservedExpertId) : null;
  const count = purchase?.photoIds.length ?? 0;
  const price = expert ? getPhotoPrice(expert, count) : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>구매 완료</h1>
      </header>

      {detail && purchase && expert && price ? (
        <div className={styles.content}>
          <section className={styles.hero}>
            <img src={checkIcon} alt="" />
            <h2 className={styles.heroTitle}>사진 {count}장을 구매했어요</h2>
            <p className={styles.heroText}>원본 화질로 저장할 수 있어요.</p>
          </section>

          <section className={`${styles.card} ${styles.cardHighlighted}`} aria-label="구매 정보">
            <div className={styles.cardTop}>
              <span className={styles.badge}>구매 완료</span>
              <span className={styles.dDay}>{formatMonthDay(purchase.paidAt)} 결제</span>
            </div>
            <p className={styles.cardTitle}>{detail.title}</p>
            <p className={styles.cardMeta}>
              {formatShootSchedule(detail.form.date, detail.form.time)} ·{' '}
              {detail.form.location.detail} · {detail.form.people}명
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
                <p className={styles.expertMessage}>후기를 남기면 작가에게 큰 힘이 돼요.</p>
              </div>
            </div>
          </section>

          <section className={styles.card} aria-label="결제 정보">
            <p className={styles.priceSummary}>결제 금액 {formatWon(price.toPay)}</p>
            <p className={styles.priceText}>
              사진 {count}장 {formatWon(price.total)} · 예약금 {formatWon(price.deposit)} 차감
            </p>
            <p className={styles.priceText}>
              원본은 {formatArchiveUntil(detail.form)}까지 보관돼요
            </p>
          </section>

          {/* TODO: 편집 맡기기(구매 사진으로 편집 요청) 화면이 생기면 그 화면으로 연결 */}
          <button
            type="button"
            className={ownStyles.editLink}
            onClick={() => navigate('/requests/new/edit')}
          >
            <span className={ownStyles.editInfo}>
              <span className={ownStyles.editTitle}>보정도 맡길까요?</span>
              <span className={ownStyles.editText}>
                구매한 사진 중 골라 {expert.name}에게 바로 요청해요
              </span>
            </span>
            <span className={ownStyles.editAction}>편집 맡기기 ›</span>
          </button>
        </div>
      ) : (
        detail && <p className={styles.notFound}>구매 정보를 찾을 수 없어요.</p>
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
          onClick={() => navigate(`/requests/${requestId}/completed`, { replace: true })}
        >
          사진 보러 가기
        </button>
      </div>
    </main>
  );
}
