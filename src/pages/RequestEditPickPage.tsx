import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import expandIcon from '../assets/icons/request/expand.svg';
import checkOffIcon from '../assets/icons/request/photo-check-off.svg';
import checkOnIcon from '../assets/icons/request/photo-check-on.svg';
import { getExpert } from '../api/experts';
import {
  fetchShootRequest,
  purchasedPhotos,
  type DeliveredPhoto,
  type ShootRequestDetail,
} from '../api/proposals';
import { PhotoViewer } from '../components/PhotoViewer';
import { withSubject } from '../utils/korean';
// 사진 격자 · 선택 표시 · 아래 버튼은 사진 고르기(구매)와 같은 모양
import pickStyles from './RequestPhotoPickPage.module.css';
import styles from './RequestEditPickPage.module.css';

// 편집 요청서에서 다시 고르기로 돌아왔을 때 고른 사진 유지
function readSelected(state: unknown): number[] {
  if (typeof state !== 'object' || state === null || !('selectedIds' in state)) return [];
  const { selectedIds } = state;
  return Array.isArray(selectedIds)
    ? selectedIds.filter((id): id is number => typeof id === 'number')
    : [];
}

// 촬영 후 편집 맡기기: 구매한 사진 중 편집할 사진 고르기 (1장 이상)
export function RequestEditPickPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = Number(requestId);
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(() => readSelected(location.state));
  const [onlySelected, setOnlySelected] = useState(false);
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

  const goBack = () => {
    if (location.key === 'default') navigate(`/requests/${id}/completed`);
    else navigate(-1);
  };

  const toggle = (photoId: number) => {
    setSelectedIds((prev) =>
      prev.includes(photoId) ? prev.filter((item) => item !== photoId) : [...prev, photoId],
    );
  };

  const expert =
    detail?.phase === 'purchased' && detail.reservedExpertId
      ? getExpert(detail.reservedExpertId)
      : null;

  if (!detail || !expert?.acceptsEdit) {
    return (
      <main className={pickStyles.page}>
        <header className={pickStyles.header}>
          <button type="button" className={pickStyles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={pickStyles.title}>편집할 사진 고르기</h1>
        </header>
        {loaded && <p className={pickStyles.notFound}>편집을 맡길 수 있는 사진이 없어요.</p>}
      </main>
    );
  }

  const photos = purchasedPhotos(detail);
  const visiblePhotos = onlySelected
    ? photos.filter((photo) => selectedIds.includes(photo.id))
    : photos;
  const count = selectedIds.length;

  // 고른 사진은 화면에 보이는 순서로 넘김. 다시 고르기로 돌아오면 그대로 남도록 기록에 저장
  const goToForm = () => {
    if (count === 0) return;
    const ordered = photos.filter((photo) => selectedIds.includes(photo.id)).map(({ id }) => id);
    navigate(location.pathname, { replace: true, state: { selectedIds: ordered } });
    navigate(`/requests/new/edit?from=${detail.id}&photos=${ordered.join(',')}`);
  };

  return (
    <main className={pickStyles.page}>
      <header className={pickStyles.header}>
        <button type="button" className={pickStyles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={pickStyles.title}>편집할 사진 고르기</h1>
      </header>

      <div className={pickStyles.content}>
        <section className={pickStyles.intro}>
          <h2 className={pickStyles.introTitle}>구매한 사진 {photos.length}장</h2>
          <p className={pickStyles.introText}>
            {expert.name}에게 보정을 맡길 사진을 1장 이상 골라 주세요.
          </p>
        </section>

        <p className={styles.info}>
          고른 사진을 보고 {withSubject(expert.name)} 샘플과 견적을 보내요
        </p>

        <div className={pickStyles.listTop}>
          <p className={pickStyles.listTitle}>
            {onlySelected ? '선택한 사진' : '전체'} {visiblePhotos.length}
          </p>
          <button
            type="button"
            aria-pressed={onlySelected}
            className={onlySelected ? `${styles.filter} ${styles.filterOn}` : styles.filter}
            onClick={() => setOnlySelected(!onlySelected)}
          >
            선택한 사진만 보기
          </button>
        </div>

        {visiblePhotos.length === 0 ? (
          <p className={pickStyles.empty}>아직 고른 사진이 없어요.</p>
        ) : (
          <ul className={pickStyles.grid}>
            {visiblePhotos.map((photo, index) => {
              const selected = selectedIds.includes(photo.id);
              return (
                <li
                  key={photo.id}
                  className={
                    selected ? `${pickStyles.tile} ${pickStyles.tileSelected}` : pickStyles.tile
                  }
                >
                  <button
                    type="button"
                    className={pickStyles.tileButton}
                    aria-pressed={selected}
                    aria-label={`사진 ${photo.id} ${selected ? '선택 해제' : '선택'}`}
                    onClick={() => toggle(photo.id)}
                  >
                    <img className={pickStyles.photo} src={photo.url} alt="" />
                    <img
                      className={pickStyles.check}
                      src={selected ? checkOnIcon : checkOffIcon}
                      alt=""
                    />
                  </button>
                  <button
                    type="button"
                    className={pickStyles.expand}
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

      <div className={pickStyles.bottomBar}>
        <div className={pickStyles.summary}>
          <span className={pickStyles.count}>{count}장 선택</span>
          <span className={pickStyles.summaryText}>
            {count > 0 ? `최대 ${photos.length}장` : '1장 이상 골라 주세요'}
          </span>
        </div>
        <button
          type="button"
          className={pickStyles.primaryButton}
          disabled={count === 0}
          onClick={goToForm}
        >
          {count > 0 ? `${count}장으로 편집 요청서 쓰기` : '편집할 사진을 골라 주세요'}
        </button>
      </div>

      {viewer && (
        <PhotoViewer
          photos={viewer.photos}
          startIndex={viewer.index}
          selectedIds={selectedIds}
          onToggle={toggle}
          countText={`${count}장 선택`}
          summaryText={count > 0 ? `최대 ${photos.length}장` : '1장 이상 골라 주세요'}
          enough={count > 0}
          onClose={() => setViewer(null)}
        />
      )}
    </main>
  );
}
