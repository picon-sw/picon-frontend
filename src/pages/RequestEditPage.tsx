import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import type { RequestDoneState, RequestExpertsState } from '../api/requests';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { createDirectEditRequest } from '../api/editRequests';
import { formatWon, getExpert, editPriceOf } from '../api/experts';
import { fetchShootRequest, purchasedPhotos, type ShootRequestDetail } from '../api/proposals';
import { fetchEditDraft } from '../api/requests';
import { AiFillBar } from '../components/AiFillBar';
import { DirectExpertBanner } from '../components/DirectExpertBanner';
import { EditPhotoPicker } from '../components/EditPhotoPicker';
import { MoodPhotoPicker } from '../components/MoodPhotoPicker';
import { PickedEditPhotos } from '../components/PickedEditPhotos';
import { withSubject } from '../utils/korean';
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

// 촬영 후 편집 맡기기 주소: ?from=촬영 의뢰 id&photos=고른 사진 id 목록
function readPhotoIds(value: string | null): number[] {
  return (value ?? '')
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}

export function RequestEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.has('from') ? Number(searchParams.get('from')) : null;
  const pickedIds = readPhotoIds(searchParams.get('photos'));
  const [source, setSource] = useState<ShootRequestDetail | null>(null);
  const [sending, setSending] = useState(false);
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
    request: fetchEditDraft,
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

  // 촬영 후 편집 맡기기면 원래 촬영 의뢰(구매한 사진 · 작가)를 불러옴
  useEffect(() => {
    if (fromId === null) return;
    let ignore = false;
    fetchShootRequest(fromId).then((result) => {
      if (!ignore) setSource(result);
    });
    return () => {
      ignore = true;
    };
  }, [fromId]);

  const sourceExpert =
    source?.phase === 'purchased' && source.reservedExpertId
      ? getExpert(source.reservedExpertId)
      : null;
  const directExpert = sourceExpert?.acceptsEdit ? sourceExpert : null;
  const pickedPhotos = source
    ? purchasedPhotos(source).filter((photo) => pickedIds.includes(photo.id))
    : [];

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
  // 촬영 후 편집 맡기기는 구매한 사진에서 1장 이상 골랐으면 됨
  const canSubmit =
    fromId !== null
      ? directExpert !== null && pickedPhotos.length > 0 && !sending
      : editPhotos.length > 0 && editPhotos.every(({ status }) => status === 'done');
  const itemText = ITEMS.filter((item) => items.includes(item)).join(', ');

  const summaryOf = (photoCount: number) => ({
    // 제목 규칙: 사진 편집 - N장 (의뢰 메인 카드와 같음)
    title: `사진 편집 - ${photoCount}장`,
    detail: [`사진 ${photoCount}장`, strength ? `보정 강도 ${strength}` : null, itemText || null]
      .filter((part): part is string => part !== null)
      .join(' · '),
  });

  // 같은 작가에게 바로 요청 (전문가 선택 없이 요청 완료로)
  const sendDirect = async () => {
    if (!canSubmit || !source || !directExpert) return;
    setSending(true);
    try {
      await createDirectEditRequest({
        expertId: directExpert.id,
        sourceRequestId: source.id,
        photos: pickedPhotos.map(({ url }) => url),
        strength,
        items: ITEMS.filter((item) => items.includes(item)),
        note: note.trim(),
      });
      const { id, name, profileImageUrl } = directExpert;
      const state: RequestDoneState = {
        summary: summaryOf(pickedPhotos.length),
        experts: [{ id, name, profileImageUrl }],
        kind: 'edit',
      };
      navigate('/requests/done', { replace: true, state });
    } catch {
      setToast('요청을 보내지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSending(false);
    }
  };

  // 다시 고르기: 사진 고르기 화면으로 (고른 사진 유지)
  const repick = () => {
    if (!source) return;
    navigate(`/requests/${source.id}/edit-photos`, {
      replace: true,
      state: { selectedIds: pickedPhotos.map(({ id }) => id) },
    });
  };

  // TODO: API 나오면 여기서 요청서(업로드한 파일 key 포함)를 저장하고 받은 requestId도 state에 담기
  const goToExperts = () => {
    if (!canSubmit) return;
    // 보정 항목은 누른 순서가 아니라 화면에 보이는 순서로
    const state: RequestExpertsState = { summary: summaryOf(editPhotos.length), kind: 'edit' };
    navigate('/requests/new/experts', { state });
  };

  return (
    <main className={shootStyles.page}>
      <header className={shootStyles.header}>
        <button type="button" className={shootStyles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={shootStyles.title}>요청서 작성</h1>
      </header>

      <div className={shootStyles.content}>
        <p className={shootStyles.intro}>
          {directExpert
            ? `${withSubject(directExpert.name)} 확인하고 샘플과 견적을 보내 드려요.`
            : '전문가를 골라 견적을 받아보세요.'}
        </p>

        <div className={shootStyles.form}>
          {directExpert && source ? (
            <>
              <DirectExpertBanner
                expert={directExpert}
                title={`${directExpert.name}에게 바로 편집을 맡겨요`}
                text={`${source.title}에서 구매한 사진 · 1장 ${formatWon(editPriceOf(directExpert))}~`}
              />
              <PickedEditPhotos
                photos={pickedPhotos.map(({ url }) => url)}
                expertName={directExpert.name}
                onRepick={repick}
              />
            </>
          ) : (
            <EditPhotoPicker
              photos={editPhotos}
              onAdd={addEditPhotos}
              onRemove={removeEditPhoto}
              onRetry={retryPhoto}
            />
          )}

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
            <AiFillBar
              status={aiStatus}
              idleMessage="사진 분위기로 요청 사항을 채워드릴게요"
              onFill={fill}
            />
          </div>
        )}
        <div className={shootStyles.bottomBar}>
          <button
            type="button"
            className={shootStyles.nextButton}
            disabled={!canSubmit}
            onClick={fromId !== null ? sendDirect : goToExperts}
          >
            {directExpert ? `${directExpert.name}에게 요청 보내기` : '작가 고르러 가기'}
          </button>
        </div>
      </div>
    </main>
  );
}
