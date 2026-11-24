import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import expandIcon from '../assets/icons/request/expand.svg';
import checkOffIcon from '../assets/icons/request/photo-check-off.svg';
import checkOnIcon from '../assets/icons/request/photo-check-on.svg';
import { BASE_PHOTO_COUNT, formatWon, getExpert, type Expert } from '../api/experts';
import {
  daysUntil,
  fetchShootRequest,
  getPhotoPrice,
  loadPhotoPick,
  pickDeadlineOf,
  savePhotoPick,
  type DeliveredPhoto,
  type ShootRequestDetail,
} from '../api/proposals';
import { PhotoViewer } from '../components/PhotoViewer';
import { formatMonthDay } from '../utils/date';
import styles from './RequestPhotoPickPage.module.css';

type PhotoFilter = 'all' | 'recommended' | 'selected';

const FILTERS: { value: Exclude<PhotoFilter, 'all'>; label: string; title: string }[] = [
  { value: 'recommended', label: '작가 추천만', title: '작가 추천' },
  { value: 'selected', label: '선택한 사진만', title: '선택한 사진' },
];

// 선택 요약 오른쪽 안내: 기본 장수까지 남은 장수 또는 추가 금액
function pickSummary(expert: Expert, count: number): { text: string; enough: boolean } {
  if (count < BASE_PHOTO_COUNT) {
    return { text: `${BASE_PHOTO_COUNT - count}장 더 골라 주세요`, enough: false };
  }
  const { extraCount, extraAmount } = getPhotoPrice(expert, count);
  if (extraCount === 0) return { text: `기본 ${BASE_PHOTO_COUNT}장 포함`, enough: true };
  return { text: `추가 ${extraCount}장 · +${formatWon(extraAmount)}`, enough: true };
}

// 촬영 후 도착한 사진 중 구매할 사진 고르기 (기본 10장 이상)
export function RequestPhotoPickPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = Number(requestId);
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(() => loadPhotoPick(id));
  const [filter, setFilter] = useState<PhotoFilter>('all');
  // 크게 보기는 연 순간의 목록으로 넘김 (선택한 사진만 보기에서 선택을 풀어도 사진이 안 빠지게)
  const [viewer, setViewer] = useState<{ photos: DeliveredPhoto[]; index: number } | null>(null);

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

  // 구매 확인에 갔다 돌아와도 고른 사진 유지
  useEffect(() => {
    savePhotoPick(id, selectedIds);
  }, [id, selectedIds]);

  const goBack = () => {
    if (location.key === 'default') navigate(`/requests/${id}/reservation`);
    else navigate(-1);
  };

  const toggle = (photoId: number) => {
    setSelectedIds((prev) =>
      prev.includes(photoId) ? prev.filter((item) => item !== photoId) : [...prev, photoId],
    );
  };

  const expert = detail?.reservedExpertId ? getExpert(detail.reservedExpertId) : null;
  const delivery = detail?.phase === 'photosArrived' ? detail.delivery : undefined;

  if (!detail || !expert || !delivery) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={styles.title}>사진 고르기</h1>
        </header>
        {loaded && <p className={styles.notFound}>고를 수 있는 사진이 없어요.</p>}
      </main>
    );
  }

  const { photos, arrivedAt } = delivery;
  const pickDeadline = pickDeadlineOf(arrivedAt);
  const visiblePhotos = photos.filter((photo) => {
    if (filter === 'recommended') return photo.recommended;
    if (filter === 'selected') return selectedIds.includes(photo.id);
    return true;
  });
  const listTitle = FILTERS.find(({ value }) => value === filter)?.title ?? '전체';
  const count = selectedIds.length;
  const enoughCount = count >= BASE_PHOTO_COUNT;
  const summary = pickSummary(expert, count);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>사진 고르기</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.intro}>
          <div className={styles.introTop}>
            <h2 className={styles.introTitle}>사진 {photos.length}장이 도착했어요</h2>
            <span className={styles.badge}>D-{daysUntil(pickDeadline)}</span>
          </div>
          <p className={styles.introText}>
            {formatMonthDay(pickDeadline)}까지 골라 주세요. 지나면 작가 추천 {BASE_PHOTO_COUNT}
            장으로 자동 구매돼요.
          </p>
        </section>

        <p className={styles.priceGuide}>
          <span>기본 {BASE_PHOTO_COUNT}장 포함</span>
          <strong>추가 1장당 {formatWon(expert.extraPrice)}</strong>
        </p>

        <div className={styles.listTop}>
          <p className={styles.listTitle}>
            {listTitle} {visiblePhotos.length}
          </p>
          <div className={styles.chips}>
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                className={filter === value ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                onClick={() => setFilter(filter === value ? 'all' : value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visiblePhotos.length === 0 ? (
          <p className={styles.empty}>아직 고른 사진이 없어요.</p>
        ) : (
          <ul className={styles.grid}>
            {visiblePhotos.map((photo, index) => {
              const selected = selectedIds.includes(photo.id);
              return (
                <li
                  key={photo.id}
                  className={selected ? `${styles.tile} ${styles.tileSelected}` : styles.tile}
                >
                  <button
                    type="button"
                    className={styles.tileButton}
                    aria-pressed={selected}
                    aria-label={`사진 ${photo.id} ${selected ? '선택 해제' : '선택'}`}
                    onClick={() => toggle(photo.id)}
                  >
                    <img className={styles.photo} src={photo.url} alt="" />
                    <img
                      className={styles.check}
                      src={selected ? checkOnIcon : checkOffIcon}
                      alt=""
                    />
                    {photo.recommended && <span className={styles.recommended}>작가 추천</span>}
                  </button>
                  <button
                    type="button"
                    className={styles.expand}
                    aria-label={`사진 ${photo.id} 크게 보기`}
                    onClick={() => setViewer({ photos: visiblePhotos, index })}
                  >
                    <img src={expandIcon} alt="" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.summary}>
          <span className={styles.count}>{count}장 선택</span>
          <span
            className={
              summary.enough ? `${styles.summaryText} ${styles.enough}` : styles.summaryText
            }
          >
            {summary.text}
          </span>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!enoughCount}
          onClick={() => navigate(`/requests/${id}/photos/purchase`)}
        >
          {enoughCount ? `${count}장 구매하기` : `${BASE_PHOTO_COUNT}장 이상 골라 주세요`}
        </button>
      </div>

      {viewer && (
        <PhotoViewer
          photos={viewer.photos}
          startIndex={viewer.index}
          selectedIds={selectedIds}
          onToggle={toggle}
          countText={`${count}장 선택`}
          summaryText={summary.text}
          enough={summary.enough}
          onClose={() => setViewer(null)}
        />
      )}
    </main>
  );
}
