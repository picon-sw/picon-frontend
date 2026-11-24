import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkIcon from '../assets/icons/request/photo-check-on.svg';
import { BASE_PHOTO_COUNT, formatExpertPrice, formatWon, getExpert } from '../api/experts';
import {
  fetchShootRequest,
  formatArchiveUntil,
  getPhotoPrice,
  pickDeadlineOf,
  purchasedPhotos,
  submitReview,
  type Review,
  type ShootRequestDetail,
} from '../api/proposals';
import { ReviewSheet } from '../components/ReviewSheet';
import { formatMonthDay, fromDateKey } from '../utils/date';
import styles from './RequestCompletedPage.module.css';

// 처음에는 6장까지 보여 주고, 6번째 칸에 남은 장수 표시 (누르면 모두 보기)
const PREVIEW_COUNT = 6;
const PEOPLE_WORDS = ['한', '두', '세', '네', '다섯'];

// 작가 안내 문구 (예: 두 분의 소중한 순간을 담았어요.)
function capturedMessage(people: number): string {
  if (people <= 1) return '소중한 순간을 담았어요.';
  return `${PEOPLE_WORDS[people - 1] ?? people} 분의 소중한 순간을 담았어요.`;
}

// 요일 없이 '11월 13일'
function formatMonthDayShort(dateKey: string): string {
  const date = fromDateKey(dateKey);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 사진을 구매해 끝난 촬영 의뢰 상세 (구매 사진 · 결제 정보 · 후기)
export function RequestCompletedPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; done?: boolean } | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchShootRequest(Number(requestId)).then((result) => {
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

  const purchase = detail?.phase === 'purchased' ? detail.purchase : undefined;
  const expert = purchase && detail?.reservedExpertId ? getExpert(detail.reservedExpertId) : null;

  const registerReview = async (review: Omit<Review, 'createdAt'>) => {
    if (!detail) return;
    await submitReview(detail.id, review);
    const next = await fetchShootRequest(detail.id);
    setDetail(next ? { ...next } : null);
    setSheetOpen(false);
    setToast({ text: '후기 등록이 완료되었어요!', done: true });
  };

  // TODO: 원본 저장 · 영수증은 백엔드 연동 후 (Pre-signed URL로 받기)
  const notReady = () => setToast({ text: '준비 중인 기능이에요.' });

  if (!detail || !purchase || !expert) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={styles.title}>완료한 촬영</h1>
        </header>
        {loaded && <p className={styles.notFound}>완료한 촬영을 찾을 수 없어요.</p>}
      </main>
    );
  }

  const { form, review } = detail;
  const photos = purchasedPhotos(detail);
  const price = getPhotoPrice(expert, photos.length);
  const rest = photos.length - PREVIEW_COUNT;
  const visiblePhotos = showAll || rest <= 0 ? photos : photos.slice(0, PREVIEW_COUNT);
  const pickDeadline = detail.delivery ? pickDeadlineOf(detail.delivery.arrivedAt) : null;

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
          <span className={styles.shootDate}>촬영일 {formatMonthDay(form.date)}</span>
        </div>

        <section className={styles.expertCard}>
          {expert.profileImageUrl ? (
            <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
          ) : (
            <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
          )}
          <div className={styles.expertInfo}>
            <p className={styles.expertName}>{expert.name}</p>
            <p className={styles.expertMessage}>{capturedMessage(form.people)}</p>
          </div>
        </section>

        {purchase.auto && pickDeadline && (
          <p className={styles.autoBox}>
            사진 고르기 기한({formatMonthDayShort(pickDeadline)})이 지나
            <br />
            작가 추천 {BASE_PHOTO_COUNT}장으로 구매됐어요.
          </p>
        )}

        <section className={styles.photos} aria-label="구매 사진">
          <div className={styles.photosTop}>
            <h2 className={styles.photosTitle}>구매 사진 · 총 {photos.length}장</h2>
            <button type="button" className={styles.textLink} onClick={notReady}>
              전체 저장
            </button>
          </div>
          <ul className={styles.grid}>
            {visiblePhotos.map((photo, index) => (
              <li key={photo.id} className={styles.photo}>
                <img src={photo.url} alt={`구매 사진 ${index + 1}`} />
                {!showAll && rest > 0 && index === PREVIEW_COUNT - 1 && (
                  <button
                    type="button"
                    className={styles.more}
                    aria-label={`사진 ${rest}장 더 보기`}
                    onClick={() => setShowAll(true)}
                  >
                    +{rest}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* TODO: 편집 맡기기(구매 사진으로 편집 요청) 화면이 생기면 그 화면으로 연결 */}
        <button
          type="button"
          className={styles.editLink}
          onClick={() => navigate('/requests/new/edit')}
        >
          <span className={styles.editInfo}>
            <span className={styles.editTitle}>보정도 맡길까요?</span>
            <span className={styles.editText}>
              구매한 사진 중 골라 {expert.name}에게 바로 요청해요
            </span>
          </span>
          <span className={styles.editAction}>편집 맡기기 ›</span>
        </button>

        <section className={styles.card} aria-label="결제 정보">
          <h2 className={styles.cardTitle}>결제 정보</h2>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>구매</dt>
              <dd>{photos.length}장</dd>
            </div>
            <div className={styles.row}>
              <dt>총 결제 금액</dt>
              <dd>{formatWon(price.total)}</dd>
            </div>
          </dl>
          <p className={styles.small}>
            기본 {BASE_PHOTO_COUNT}장 {formatWon(expert.basePrice)}
            {price.extraCount > 0 &&
              ` + 추가 ${price.extraCount}장 ${formatWon(price.extraAmount)}`}{' '}
            (예약금 {formatWon(price.deposit)} 포함)
          </p>
          <hr className={styles.divider} />
          <p className={styles.small}>촬영 견적 기준</p>
          <p className={styles.priceBasis}>{formatExpertPrice(expert)}</p>
          <button type="button" className={styles.textLink} onClick={notReady}>
            영수증 보기
          </button>
        </section>

        <p className={styles.archive}>{formatArchiveUntil(form)}까지 보관돼요</p>
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
          subtitle={`${detail.title} · ${formatMonthDay(form.date)}`}
          review={review}
          onSubmit={registerReview}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </main>
  );
}
