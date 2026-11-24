import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import checkIcon from '../assets/icons/request/check-large.svg';
import { formatWon, getExpert } from '../api/experts';
import {
  editDueDate,
  fetchEditRequest,
  formatEditPrice,
  getEditPrice,
  type EditRequestDetail,
} from '../api/editRequests';
import { daysUntil } from '../api/proposals';
import { formatMonthDay } from '../utils/date';
import { withSubject } from '../utils/korean';
// 완료 화면 모양은 촬영 의뢰의 예약 완료와 같음
import styles from './RequestReservedPage.module.css';

// 편집 금액 결제 후 결제 완료 (뒤로 가기 없음: 견적서로 돌아가지 않게)
export function RequestEditPaidPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchEditRequest(Number(requestId)).then((result) => {
      if (!ignore) setDetail(result);
    });
    return () => {
      ignore = true;
    };
  }, [requestId]);

  const expert = detail?.phase === 'waiting' && detail.expertId ? getExpert(detail.expertId) : null;
  const due = detail ? editDueDate(detail) : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>결제 완료</h1>
      </header>

      {detail && expert ? (
        <div className={styles.content}>
          <section className={styles.hero}>
            <img src={checkIcon} alt="" />
            <h2 className={styles.heroTitle}>보정을 맡겼어요</h2>
            <p className={styles.heroText}>
              {withSubject(expert.name)} 작업을 시작하면 알려 드려요.
            </p>
          </section>

          <section className={`${styles.card} ${styles.cardHighlighted}`} aria-label="작업 정보">
            <div className={styles.cardTop}>
              <span className={styles.badge}>작업 대기</span>
              {due && <span className={styles.dDay}>완료 D-{daysUntil(due)}</span>}
            </div>
            <p className={styles.cardTitle}>{detail.title}</p>
            <p className={styles.cardMeta}>
              사진 {detail.photos.length}장{due && ` · ${formatMonthDay(due)}까지 완료 예정`}
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
                <p className={styles.expertMessage}>작업 시작 전에는 취소하면 전액 환불돼요.</p>
              </div>
            </div>
          </section>

          <section className={styles.card} aria-label="결제 정보">
            <p className={styles.priceSummary}>{formatEditPrice(expert, detail.photos.length)}</p>
            <p className={styles.priceText}>수정 1회 포함</p>
            <p className={styles.priceText}>
              {formatWon(getEditPrice(expert, detail.photos.length))} 결제 완료
            </p>
          </section>
        </div>
      ) : (
        detail && <p className={styles.notFound}>결제 정보를 찾을 수 없어요.</p>
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
          onClick={() => navigate(`/requests/edits/${requestId}/work`, { replace: true })}
        >
          작업 상세 보기
        </button>
      </div>
    </main>
  );
}
