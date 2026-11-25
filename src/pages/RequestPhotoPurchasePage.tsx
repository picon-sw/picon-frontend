import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { BASE_PHOTO_COUNT, formatWon, getExpert } from '../api/experts';
import {
  PAYMENT_METHODS,
  fetchShootRequest,
  formatArchiveUntil,
  getPhotoPrice,
  loadPhotoPick,
  purchasePhotos,
  type PaymentMethod,
  type ShootRequestDetail,
} from '../api/proposals';
import { PaymentMethodList } from '../components/PaymentMethodList';
import styles from './RequestPhotoPurchasePage.module.css';

// 미리 보기는 4장까지, 다섯 번째 칸에 남은 장수
const PREVIEW_COUNT = 4;

// 고른 사진 구매 확인 (예약금을 뺀 금액 결제)
export function RequestPhotoPurchasePage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = Number(requestId);
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds] = useState(() => loadPhotoPick(id));

  useEffect(() => {
    let ignore = false;
    fetchShootRequest(id).then((result) => {
      if (ignore) return;
      setDetail(result);
      setLoaded(true);
    });
    return () => {
      ignore = true;
    };
  }, [id]);

  // 기본 장수보다 적게 골랐으면(새로고침 등) 사진 고르기로 돌려보냄
  if (selectedIds.length < BASE_PHOTO_COUNT) {
    return <Navigate to={`/requests/${id}/photos`} replace />;
  }

  const goBack = () => {
    if (location.key === 'default') navigate(`/requests/${id}/photos`);
    else navigate(-1);
  };

  const expert = detail?.reservedExpertId ? getExpert(detail.reservedExpertId) : null;
  const photos =
    detail?.phase === 'photosArrived' && detail.delivery
      ? detail.delivery.photos.filter((photo) => selectedIds.includes(photo.id))
      : [];
  const price = expert ? getPhotoPrice(expert, selectedIds.length) : null;
  const ready = detail && expert && price && photos.length > 0;

  const pay = async () => {
    if (!detail || paying) return;
    setPaying(true);
    setError(null);
    try {
      await purchasePhotos(detail.id, selectedIds, method);
      navigate(`/requests/${detail.id}/purchased`, { replace: true });
    } catch {
      setError('결제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setPaying(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>구매 확인</h1>
      </header>

      {ready ? (
        <div className={styles.content}>
          <section className={styles.card} aria-label="선택한 사진">
            <h2 className={styles.cardTitle}>선택한 사진 {photos.length}장</h2>
            <ul className={styles.previews}>
              {photos.slice(0, PREVIEW_COUNT + 1).map((photo, index) => {
                const rest = photos.length - PREVIEW_COUNT;
                return (
                  <li key={photo.id} className={styles.preview}>
                    <img src={photo.url} alt="" />
                    {index === PREVIEW_COUNT && rest > 1 && (
                      <span className={styles.more}>+{rest}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.card} aria-label="결제 금액">
            <h2 className={styles.cardTitle}>결제 금액</h2>
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>기본 {BASE_PHOTO_COUNT}장</dt>
                <dd>{formatWon(expert.basePrice)}</dd>
              </div>
              {price.extraCount > 0 && (
                <div className={styles.row}>
                  <dt>
                    추가 {price.extraCount}장 ({formatWon(expert.extraPrice)} × {price.extraCount})
                  </dt>
                  <dd>{formatWon(price.extraAmount)}</dd>
                </div>
              )}
              <div className={styles.row}>
                <dt>예약금 차감</dt>
                <dd className={styles.minus}>−{formatWon(price.deposit)}</dd>
              </div>
            </dl>
            <hr className={styles.divider} />
            <p className={styles.total}>
              <span>결제할 금액</span>
              <strong>{formatWon(price.toPay)}</strong>
            </p>
          </section>

          <section className={styles.card} aria-label="결제 수단">
            <h2 className={styles.cardTitle}>결제 수단</h2>
            <PaymentMethodList value={method} onChange={setMethod} />
          </section>

          <ul className={styles.notes}>
            <li>결제한 사진은 원본 화질로 저장할 수 있어요.</li>
            <li>결제 후에는 고른 사진을 바꾸거나 환불할 수 없어요.</li>
            <li>원본 사진은 {formatArchiveUntil(detail.form)}까지 보관돼요.</li>
          </ul>
        </div>
      ) : (
        loaded && <p className={styles.notFound}>구매할 사진을 찾을 수 없어요.</p>
      )}

      {error && (
        <p className={styles.toast} role="alert">
          {error}
        </p>
      )}

      {ready && (
        <div className={styles.bottomBar}>
          <button type="button" className={styles.primaryButton} disabled={paying} onClick={pay}>
            {formatWon(price.toPay)} 결제하기
          </button>
        </div>
      )}
    </main>
  );
}
