import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { AiFillBar } from '../components/AiFillBar';
import { EditPhotoPicker } from '../components/EditPhotoPicker';
import { MoodPhotoPicker } from '../components/MoodPhotoPicker';
import { useAiFill } from '../hooks/useAiFill';
import { useEditPhotos } from '../hooks/useEditPhotos';
import { useMoodPhotos } from '../hooks/useMoodPhotos';
// 앱바 · 카드 · 칩 · 요청 사항 · 하단 버튼은 촬영 요청서와 같은 스타일 사용
import shootStyles from './RequestShootPage.module.css';
import styles from './RequestEditPage.module.css';

const STRENGTHS = ['자연스럽게', '보통', '확실하게'] as const;
const ITEMS = ['피부·잡티', '색감', '얼굴형', '체형', '배경 정리·합성', '복원'] as const;

type Strength = (typeof STRENGTHS)[number];
type Item = (typeof ITEMS)[number];

const NOTE_MAX_LENGTH = 500;

interface ChipProps {
  label: string;
  selected: boolean;
  role: 'radio' | 'checkbox';
  onClick: () => void;
}

function Chip({ label, selected, role, onClick }: ChipProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      className={selected ? `${shootStyles.chip} ${shootStyles.chipSelected}` : shootStyles.chip}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function RequestEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState<string | null>(null);
  const {
    photos: editPhotos,
    addPhotos: addEditPhotos,
    removePhoto: removeEditPhoto,
    retryPhoto,
  } = useEditPhotos({ onReject: setToast });
  // 보정 강도는 다시 누르면 선택 해제 (보정 옵션은 선택 항목)
  const [strength, setStrength] = useState<Strength | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [note, setNote] = useState('');
  const { photos, addPhotos, removePhoto } = useMoodPhotos();

  const { status: aiStatus, fill } = useAiFill({
    photos,
    kind: 'edit',
    // 생성된 문장은 요청 사항 뒤에 추가, 500자 넘으면 잘라냄
    onFilled: (text) => {
      const next = note.trim() ? `${note}\n${text}` : text;
      if (next.length > NOTE_MAX_LENGTH) {
        setToast(`${NOTE_MAX_LENGTH}자를 넘는 부분은 잘렸어요`);
      }
      setNote(next.slice(0, NOTE_MAX_LENGTH));
    },
    onError: () => setToast('요청 사항을 만들지 못했어요'),
  });

  // 토스트는 2초 뒤 사라짐
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 주소로 바로 들어온 경우(이전 화면 없음)는 의뢰 메인으로
  const goBack = () => {
    if (location.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  const toggleItem = (item: Item) => {
    setItems(items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  };

  // 보정할 사진이 1장 이상이고, 모두 업로드가 끝나야 다음으로
  const canSubmit = editPhotos.length > 0 && editPhotos.every(({ status }) => status === 'done');

  return (
    <main className={shootStyles.page}>
      <header className={shootStyles.header}>
        <button type="button" className={shootStyles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={shootStyles.title}>요청서 작성</h1>
      </header>

      <div className={shootStyles.content}>
        <p className={shootStyles.intro}>전문가를 골라 견적을 받아보세요.</p>

        <div className={shootStyles.form}>
          <EditPhotoPicker
            photos={editPhotos}
            onAdd={addEditPhotos}
            onRemove={removeEditPhoto}
            onRetry={retryPhoto}
          />

          <section className={shootStyles.card}>
            <h2 className={shootStyles.cardTitle}>보정 옵션</h2>
            <p className={styles.guide}>참고용이라 편하게 골라 주세요</p>

            <div className={styles.group}>
              <span className={styles.groupLabel} id="edit-strength">
                보정 강도
              </span>
              <div className={shootStyles.chips} role="radiogroup" aria-labelledby="edit-strength">
                {STRENGTHS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    role="radio"
                    selected={strength === option}
                    onClick={() => setStrength(strength === option ? null : option)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <span className={styles.groupLabel} id="edit-items">
                보정 항목 <span className={styles.groupHint}>여러 개 선택</span>
              </span>
              <div className={shootStyles.chips} role="group" aria-labelledby="edit-items">
                {ITEMS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    role="checkbox"
                    selected={items.includes(option)}
                    onClick={() => toggleItem(option)}
                  />
                ))}
              </div>
            </div>
          </section>

          <MoodPhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} />

          <section className={`${shootStyles.card} ${shootStyles.noteCard}`}>
            <h2 className={shootStyles.cardTitle}>요청 사항 · 선택</h2>
            <label className={shootStyles.noteGuide} htmlFor="edit-note">
              사진별로 원하는 보정이 있다면 적어 주세요
            </label>
            <textarea
              id="edit-note"
              className={shootStyles.note}
              value={note}
              rows={3}
              maxLength={NOTE_MAX_LENGTH}
              placeholder="예) 턱선만 살짝, 피부는 자연스럽게 해 주세요."
              readOnly={aiStatus === 'loading'}
              onChange={(event) => setNote(event.target.value)}
            />
            <span className={shootStyles.counter}>
              {note.length}/{NOTE_MAX_LENGTH}
            </span>
          </section>
        </div>
      </div>

      {toast && (
        <p className={shootStyles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={shootStyles.footer}>
        {photos.length > 0 && (
          <div className={shootStyles.aiBar}>
            <AiFillBar photoCount={photos.length} status={aiStatus} onFill={fill} />
          </div>
        )}
        <div className={shootStyles.bottomBar}>
          {/* TODO: 전문가 선택 화면 이동은 Routing 항목에서 */}
          <button type="button" className={shootStyles.nextButton} disabled={!canSubmit}>
            작가 고르러 가기
          </button>
        </div>
      </div>
    </main>
  );
}
