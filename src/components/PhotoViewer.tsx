import { useEffect, useRef, useState } from 'react';
import closeIcon from '../assets/icons/request/close-white.svg';
import checkOnIcon from '../assets/icons/request/photo-check-on-large.svg';
import type { DeliveredPhoto } from '../api/proposals';
import styles from './PhotoViewer.module.css';

// 한 장 넘길 때 움직이는 거리: 사진 너비(화면 - 좌우 여백 40px) + 사진 사이 12px
function slideStep(track: HTMLElement): number {
  return track.clientWidth - 40 + 12;
}

interface PhotoViewerProps {
  photos: DeliveredPhoto[];
  startIndex: number;
  selectedIds: number[];
  onToggle: (photoId: number) => void;
  // 아래 선택 요약 (예: 12장 선택 / 추가 2장 · +10,000원)
  countText: string;
  summaryText: string;
  // 기본 장수를 채웠으면 요약을 파란 글씨로
  enough: boolean;
  onClose: () => void;
}

// 사진 크게 보기: 옆으로 넘겨 보며 바로 고르고, '선택 완료'로 목록에 돌아감
export function PhotoViewer({
  photos,
  startIndex,
  selectedIds,
  onToggle,
  countText,
  summaryText,
  enough,
  onClose,
}: PhotoViewerProps) {
  const [index, setIndex] = useState(startIndex);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 처음 연 사진으로 바로 이동
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = startIndex * slideStep(track);
  }, [startIndex]);

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / slideStep(track));
    setIndex(Math.min(Math.max(next, 0), photos.length - 1));
  };

  const goTo = (next: number) => {
    const track = trackRef.current;
    track?.scrollTo({ left: next * slideStep(track), behavior: 'smooth' });
  };

  const current = photos[index];
  const selected = current ? selectedIds.includes(current.id) : false;

  return (
    <div className={styles.viewer} role="dialog" aria-modal="true" aria-label="사진 크게 보기">
      <div className={styles.topBar}>
        <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
          <img src={closeIcon} alt="" />
        </button>
        <p className={styles.counter}>
          {index + 1} / {photos.length}
        </p>
        {current && (
          <button
            type="button"
            className={selected ? `${styles.toggle} ${styles.toggleOn}` : styles.toggle}
            aria-pressed={selected}
            onClick={() => onToggle(current.id)}
          >
            {selected ? '선택됨' : '선택'}
            {selected ? (
              <img src={checkOnIcon} alt="" />
            ) : (
              <span className={styles.toggleCircle} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <div className={styles.track} ref={trackRef} onScroll={onScroll}>
        {photos.map((photo, photoIndex) => (
          <div
            key={photo.id}
            className={[
              styles.slide,
              photoIndex === index && styles.slideCurrent,
              selectedIds.includes(photo.id) && styles.slideSelected,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <img src={photo.url} alt={`사진 ${photoIndex + 1}`} />
            {photo.recommended && <span className={styles.badge}>작가 추천</span>}
          </div>
        ))}
      </div>
      <p className={styles.hint}>옆으로 넘겨 다음 사진을 볼 수 있어요</p>

      <div className={styles.thumbs}>
        {photos.map((photo, photoIndex) => (
          <button
            key={photo.id}
            type="button"
            ref={(element) => {
              thumbRefs.current[photoIndex] = element;
            }}
            className={
              photoIndex === index ? `${styles.thumb} ${styles.thumbCurrent}` : styles.thumb
            }
            aria-label={`${photoIndex + 1}번째 사진 보기`}
            aria-current={photoIndex === index}
            onClick={() => goTo(photoIndex)}
          >
            <img src={photo.url} alt="" />
          </button>
        ))}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.summary}>
          <span className={styles.count}>{countText}</span>
          <span className={enough ? `${styles.summaryText} ${styles.enough}` : styles.summaryText}>
            {summaryText}
          </span>
        </div>
        <button type="button" className={styles.doneButton} onClick={onClose}>
          선택 완료
        </button>
      </div>
    </div>
  );
}
