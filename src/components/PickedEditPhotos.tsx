import pickerStyles from './EditPhotoPicker.module.css';
import styles from './PickedEditPhotos.module.css';

interface PickedEditPhotosProps {
  // 구매한 사진 중 고른 사진 주소
  photos: string[];
  expertName: string;
  onRepick: () => void;
}

// 촬영 후 편집 맡기기: 구매한 사진에서 고른 보정할 사진 (올리기 대신 다시 고르기)
// 보정할 사진 카드(EditPhotoPicker)와 같은 모양
export function PickedEditPhotos({ photos, expertName, onRepick }: PickedEditPhotosProps) {
  return (
    <section className={pickerStyles.card}>
      <div className={pickerStyles.top}>
        <h2 className={pickerStyles.title}>보정할 사진</h2>
        <button type="button" className={styles.repick} onClick={onRepick}>
          다시 고르기 ›
        </button>
      </div>

      <ul className={pickerStyles.grid}>
        {photos.map((url, index) => (
          <li key={`${url}-${index}`} className={pickerStyles.cell}>
            <img className={pickerStyles.photo} src={url} alt={`보정할 사진 ${index + 1}`} />
          </li>
        ))}
      </ul>

      <p className={pickerStyles.meta}>
        구매한 사진에서 {photos.length}장을 골랐어요 · 원본 화질 그대로 전달돼요
      </p>
      <p className={pickerStyles.notice}>고른 사진은 {expertName}에게만 보여요</p>
    </section>
  );
}
