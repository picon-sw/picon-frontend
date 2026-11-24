import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkIcon from '../assets/icons/request/photo-check-on.svg';
import { editPriceOf, formatWon, getExpert } from '../api/experts';
import {
  fetchEditRequest,
  formatEditArchiveUntil,
  formatEditPrice,
  getEditPrice,
  submitEditReview,
  type EditRequestDetail,
} from '../api/editRequests';
import { EDIT_REVIEW_KEYWORDS, type Review } from '../api/proposals';
import { ReviewSheet } from '../components/ReviewSheet';
import { formatMonthDay } from '../utils/date';
// 완료 상세 모양은 촬영 의뢰의 완료한 촬영과 같음
import styles from './RequestCompletedPage.module.css';

// 확인 완료한 편집 의뢰 상세 (보정 사진 · 결제 정보 · 후기)
export function RequestEditCompletedPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; done?: boolean } | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchEditRequest(Number(requestId)).then((result) => {
      if (ignore) return;
      setDetail(result);
      setLoaded(true);
    });
    return () => {
      ignore = true;
    };
  }, [requestId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const goBack = () => {
    if (location.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  const expert =
    detail?.phase === 'completed' && detail.expertId ? getExpert(detail.expertId) : null;

  const registerReview = async (review: Omit<Review, 'createdAt'>) => {
    if (!detail) return;
    await submitEditReview(detail.id, review);
    const next = await fetchEditRequest(detail.id);
    setDetail(next ? { ...next } : null);
    setSheetOpen(false);
    setToast({ text: '후기 등록이 완료되었어요!', done: true });
  };

  // TODO: 원본 저장 · 영수증은 백엔드 연동 후 (Pre-signed URL로 받기)
  const notReady = () => setToast({ text: '준비 중인 기능이에요.' });

  if (!detail || !expert || !detail.completedAt) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={styles.title}>완료한 편집</h1>
        </header>
        {loaded && <p className={styles.notFound}>완료한 편집을 찾을 수 없어요.</p>}
      </main>
    );
  }

  const { photos, review } = detail;
  const total = getEditPrice(expert, photos.length);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>{detail.title}</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.top}>
          <span className={styles.badge}>완료</span>
          <span className={styles.shootDate}>완료일 {formatMonthDay(detail.completedAt)}</span>
        </div>

        <section className={styles.expertCard}>
          {expert.profileImageUrl ? (
            <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
          ) : (
            <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
          )}
          <div className={styles.expertInfo}>
            <p className={styles.expertName}>{expert.name}</p>
            <p className={styles.expertMessage}>보내 주신 사진을 맑게 다듬었어요.</p>
          </div>
        </section>

        <section className={styles.photos} aria-label="보정 사진">
          <div className={styles.photosTop}>
            <h2 className={styles.photosTitle}>보정 사진 · 총 {photos.length}장</h2>
            <button type="button" className={styles.textLink} onClick={notReady}>
              전체 저장
            </button>
          </div>
          <ul className={styles.grid}>
            {photos.map((url, index) => (
              <li key={`${url}-${index}`} className={styles.photo}>
                <img src={url} alt={`보정 사진 ${index + 1}`} />
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card} aria-label="결제 정보">
          <h2 className={styles.cardTitle}>결제 정보</h2>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>보정</dt>
              <dd>{photos.length}장</dd>
            </div>
            <div className={styles.row}>
              <dt>총 결제 금액</dt>
              <dd>{formatWon(total)}</dd>
            </div>
          </dl>
          <p className={styles.small}>
            {photos.length}장 × {formatWon(editPriceOf(expert))} · 수정{' '}
            {detail.revisionUsed ? '1회 사용' : '사용 안 함'}
          </p>
          <hr className={styles.divider} />
          <p className={styles.small}>편집 견적 기준</p>
          <p className={styles.priceBasis}>{formatEditPrice(expert, photos.length)}</p>
          <button type="button" className={styles.textLink} onClick={notReady}>
            영수증 보기
          </button>
        </section>

        <p className={styles.archive}>{formatEditArchiveUntil(detail)}까지 보관돼요</p>
      </div>

      {toast && (
        <p className={styles.toast} role="status">
          {toast.done && <img src={checkIcon} alt="" />}
          {toast.text}
        </p>
      )}

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={review ? styles.secondaryButton : styles.primaryButton}
          onClick={() => setSheetOpen(true)}
        >
          {review ? '후기 보기' : '후기 쓰기'}
        </button>
      </div>

      {sheetOpen && (
        <ReviewSheet
          expert={expert}
          subtitle={`${detail.title} · ${formatMonthDay(detail.completedAt)}`}
          review={review}
          keywordOptions={EDIT_REVIEW_KEYWORDS}
          onSubmit={registerReview}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </main>
  );
}
