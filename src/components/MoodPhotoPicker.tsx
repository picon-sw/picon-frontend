import { useRef } from 'react';
import closeIcon from '../assets/icons/explore/close.svg';
import { MAX_MOOD_PHOTOS, type MoodPhoto } from '../hooks/useMoodPhotos';
import styles from './MoodPhotoPicker.module.css';

interface MoodPhotoPickerProps {
  photos: MoodPhoto[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

// 원하는 분위기 사진 카드. 올린 순서대로 왼쪽 정렬, + 칸은 마지막 사진 오른쪽
export function MoodPhotoPicker({ photos, onAdd, onRemove }: MoodPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={styles.card}>
      <div className={styles.top}>
        <h2 className={styles.title}>원하는 분위기</h2>
        <span className={styles.limit}>사진 최대 {MAX_MOOD_PHOTOS}장</span>
      </div>

      <ul className={styles.slots}>
        {photos.map(({ id, previewUrl }, index) => (
          <li key={id} className={styles.slot}>
            <img className={styles.photo} src={previewUrl} alt={`분위기 사진 ${index + 1}`} />
            <button
              type="button"
              className={styles.remove}
              aria-label={`분위기 사진 ${index + 1} 삭제`}
              onClick={() => onRemove(id)}
            >
              <img src={closeIcon} alt="" />
            </button>
          </li>
        ))}

        {photos.length < MAX_MOOD_PHOTOS && (
          <li>
            <button
              type="button"
              className={`${styles.slot} ${styles.add}`}
              aria-label="분위기 사진 추가"
              onClick={() => inputRef.current?.click()}
            >
              +
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/*"
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
