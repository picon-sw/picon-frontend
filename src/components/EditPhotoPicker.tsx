import { useRef, useState } from 'react';
import closeIcon from '../assets/icons/explore/close.svg';
import { MAX_EDIT_PHOTOS, type EditPhoto } from '../hooks/useEditPhotos';
import styles from './EditPhotoPicker.module.css';

interface EditPhotoPickerProps {
  photos: EditPhoto[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

// 접힌 상태에서 보이는 칸 수 (한 줄 4칸 × 2줄)
const COLLAPSED_CELLS = 8;

// 보정할 사진 카드. 맨 앞 + 칸으로 추가, 2줄을 넘으면 마지막 칸에 +n → 펼침 / 접기
export function EditPhotoPicker({ photos, onAdd, onRemove, onRetry }: EditPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);

  const canAdd = photos.length < MAX_EDIT_PHOTOS;
  const addCells = canAdd ? 1 : 0;
  const overflowing = addCells + photos.length > COLLAPSED_CELLS;
  // 접혔을 때는 + 칸과 +n 칸을 뺀 만큼만 사진 표시
  const visible =
    overflowing && !expanded ? photos.slice(0, COLLAPSED_CELLS - addCells - 1) : photos;
  const hiddenCount = photos.length - visible.length;

  return (
    <section className={styles.card}>
      <div className={styles.top}>
        <h2 className={styles.title}>보정할 사진</h2>
        <span className={styles.limit}>최대 {MAX_EDIT_PHOTOS}장</span>
      </div>

      <ul className={styles.grid}>
        {canAdd && (
          <li>
            <button
              type="button"
              className={`${styles.cell} ${styles.add}`}
              aria-label="보정할 사진 추가"
              onClick={() => inputRef.current?.click()}
            >
              +
            </button>
          </li>
        )}

        {visible.map(({ id, previewUrl, status, progress }, index) => (
          <li key={id} className={styles.cell}>
            <img className={styles.photo} src={previewUrl} alt={`보정할 사진 ${index + 1}`} />

            {status === 'uploading' && (
              <div className={styles.overlay}>
                <span className={styles.percent}>{Math.round(progress * 100)}%</span>
                <span
                  className={styles.progress}
                  role="progressbar"
                  aria-label={`보정할 사진 ${index + 1} 업로드 중`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  <span className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
                </span>
              </div>
            )}

            {status === 'error' && (
              <div className={`${styles.overlay} ${styles.failed}`}>
                <button
                  type="button"
                  className={styles.retry}
                  aria-label={`보정할 사진 ${index + 1} 다시 올리기`}
                  onClick={() => onRetry(id)}
                >
                  다시 시도
                </button>
              </div>
            )}

            <button
              type="button"
              className={styles.remove}
              aria-label={`보정할 사진 ${index + 1} 삭제`}
              onClick={() => onRemove(id)}
            >
              <img src={closeIcon} alt="" />
            </button>
          </li>
        ))}

        {hiddenCount > 0 && (
          <li>
            <button
              type="button"
              className={`${styles.cell} ${styles.more}`}
              aria-label={`사진 ${hiddenCount}장 더 보기`}
              aria-expanded={false}
              onClick={() => setExpanded(true)}
            >
              +{hiddenCount}
            </button>
          </li>
        )}
      </ul>

      {overflowing && expanded && (
        <button
          type="button"
          className={styles.collapse}
          aria-expanded={true}
          onClick={() => setExpanded(false)}
        >
          접기
        </button>
      )}

      <p className={styles.meta}>{photos.length}장 올림 · 원본 화질 그대로 업로드돼요</p>
      <p className={styles.notice}>올린 사진은 요청을 보낸 전문가에게만 공개돼요</p>

      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          onAdd(Array.from(event.target.files ?? []));
          // 같은 파일을 다시 골라도 onChange가 오도록 비움
          event.target.value = '';
        }}
      />
    </section>
  );
}
