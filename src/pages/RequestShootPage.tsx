import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import calendarIcon from '../assets/icons/request/calendar-box.svg';
import clockIcon from '../assets/icons/request/clock.svg';
import mapIcon from '../assets/icons/request/map.svg';
import { formatLocation, type ShootLocation } from '../api/places';
import {
  fetchShootDraft,
  formatShootSchedule,
  type RequestExpertsState,
  type ShootDraft,
} from '../api/requests';
import { AiFillBar } from '../components/AiFillBar';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { MoodPhotoPicker } from '../components/MoodPhotoPicker';
import { RegionPickerSheet } from '../components/RegionPickerSheet';
import { TimePickerSheet } from '../components/TimePickerSheet';
import {
  BUDGETS,
  MAX_MOODS,
  MOODS,
  SHOOT_CATEGORIES,
  SHOOT_CATEGORY_NAMES,
  isShootKindDone,
  type Budget,
  type ShootKind,
} from '../constants/requestOptions';
import { useAiFill } from '../hooks/useAiFill';
import { useMoodPhotos } from '../hooks/useMoodPhotos';
import { addDays, addMonths, formatMonthDay, startOfToday, toDateKey } from '../utils/date';
import styles from './RequestShootPage.module.css';

const MIN_PEOPLE = 1;
const MAX_PEOPLE = 20;
const NOTE_MAX_LENGTH = 500;
// 희망 날짜: 오늘 + 4일 ~ 오늘 + 1개월
const DATE_MIN_DAYS = 4;
const DATE_MAX_MONTHS = 1;

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  // 고른 값 (여러 개 고르는 칩이면 여러 개)
  selected: readonly string[];
  // 여러 개 고르는 칩이면 true (체크박스 역할)
  multiple?: boolean;
  onToggle: (value: T) => void;
}

// 칩 선택 (단일: 라디오, 여러 개: 체크박스 역할로 키보드 선택 가능)
function ChipGroup<T extends string>({
  label,
  options,
  selected,
  multiple = false,
  onToggle,
}: ChipGroupProps<T>) {
  return (
    <div className={styles.chips} role={multiple ? 'group' : 'radiogroup'} aria-label={label}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            className={isSelected ? `${styles.chip} ${styles.chipSelected}` : styles.chip}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

interface PickFieldProps {
  label: string;
  value: string | null;
  placeholder: string;
  icon: string;
  onClick: () => void;
}

// 누르면 바텀시트가 열리는 선택 칸 (값 + 정사각 테두리 아이콘)
function PickField({ label, value, placeholder, icon, onClick }: PickFieldProps) {
  return (
    <button type="button" className={styles.pick} aria-haspopup="dialog" onClick={onClick}>
      <span className={styles.pickLabel}>{label}</span>
      <span className={styles.pickValue}>
        <span className={value ? styles.pickText : `${styles.pickText} ${styles.placeholder}`}>
          {value ?? placeholder}
        </span>
        <span className={styles.pickIcon}>
          <img src={icon} alt="" />
        </span>
      </span>
    </button>
  );
}

export function RequestShootPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  // 희망 날짜는 'YYYY-MM-DD', 희망 시간은 'HH:mm'
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  // 날짜를 바꿔서 시간이 지워졌을 때 안내
  const [timeReset, setTimeReset] = useState(false);
  const [location, setLocation] = useState<ShootLocation | null>(null);
  const [openSheet, setOpenSheet] = useState<'date' | 'time' | 'location' | null>(null);
  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [kind, setKind] = useState<ShootKind | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { photos, addPhotos, removePhoto } = useMoodPhotos();

  const { status: aiStatus, fill } = useAiFill<ShootDraft>({
    photos,
    request: fetchShootDraft,
    // 촬영 종류 · 분위기는 덮어쓰고, 요청 사항은 뒤에 추가 (500자 넘으면 잘라냄)
    onFilled: (draft) => {
      setKind(draft.kind);
      setMoods(draft.moods.slice(0, MAX_MOODS));
      const next = note.trim() ? `${note}\n${draft.note}` : draft.note;
      if (next.length > NOTE_MAX_LENGTH) {
        setToast(`${NOTE_MAX_LENGTH}자를 넘는 부분은 잘렸어요`);
      }
      setNote(next.slice(0, NOTE_MAX_LENGTH));
    },
    onError: () => setToast('요청서를 채우지 못했어요'),
  });

  // 토스트는 2초 뒤 사라짐
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 주소로 바로 들어온 경우(이전 화면 없음)는 의뢰 메인으로
  const goBack = () => {
    if (routerLocation.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  const changeDate = (next: string) => {
    // 날짜가 바뀌면 고른 시간은 그 날짜에 안 맞을 수 있어서 초기화
    if (next !== date && time !== null) {
      setTime(null);
      setTimeReset(true);
    }
    setDate(next);
    setOpenSheet(null);
  };

  const openTimeSheet = () => {
    // 시간은 날짜를 먼저 골라야 함
    if (date === null) {
      setToast('희망 날짜를 먼저 골라 주세요');
      return;
    }
    setOpenSheet('time');
  };

  const changeCategory = (category: ShootKind['category']) => {
    if (kind?.category === category) return;
    setKind({ category, subcategory: null });
  };

  const toggleMood = (mood: string) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter((item) => item !== mood));
      return;
    }
    if (moods.length >= MAX_MOODS) {
      setToast(`분위기는 최대 ${MAX_MOODS}개까지 고를 수 있어요`);
      return;
    }
    setMoods([...moods, mood]);
  };

  const subcategories = kind ? SHOOT_CATEGORIES[kind.category] : [];
  const canSubmit =
    date !== null &&
    time !== null &&
    location !== null &&
    budget !== null &&
    photos.length > 0 &&
    isShootKindDone(kind) &&
    moods.length > 0;

  // TODO: API 나오면 여기서 요청서를 저장하고 받은 requestId도 state에 담기
  const goToExperts = () => {
    if (!canSubmit || date === null || time === null || location === null) return;
    if (budget === null || !isShootKindDone(kind)) return;
    const state: RequestExpertsState = {
      summary: {
        // 제목 규칙: 상세 주소 + 스냅
        title: `${location.detail} 스냅`,
        detail: `${formatShootSchedule(date, time)} · ${formatLocation(location)} · 촬영 인원 ${people}명`,
      },
      form: { date, time, location, people, budget, kind, moods, note: note.trim() },
    };
    navigate('/requests/new/experts', { state });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>요청서 작성</h1>
      </header>

      <div className={styles.content}>
        <p className={styles.intro}>전문가를 골라 견적을 받아보세요.</p>

        <div className={styles.form}>
          <section className={styles.card} aria-label="촬영 일정">
            <div className={styles.schedule}>
              <PickField
                label="희망 날짜"
                value={date ? formatMonthDay(date) : null}
                placeholder="선택해 주세요"
                icon={calendarIcon}
                onClick={() => setOpenSheet('date')}
              />
              <PickField
                label="희망 시간"
                value={time}
                placeholder="시간 선택"
                icon={clockIcon}
                onClick={openTimeSheet}
              />
            </div>
            {timeReset && time === null && (
              <p className={styles.warning} role="alert">
                날짜가 바뀌어서 시간을 다시 골라 주세요
              </p>
            )}

            <div className={styles.schedule}>
              <PickField
                label="촬영 지역"
                value={location ? formatLocation(location) : null}
                placeholder="선택해 주세요"
                icon={mapIcon}
                onClick={() => setOpenSheet('location')}
              />
            </div>

            <div className={styles.people}>
              <span className={styles.peopleLabel}>인원</span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepButton}
                  aria-label="인원 줄이기"
                  disabled={people <= MIN_PEOPLE}
                  onClick={() => setPeople(people - 1)}
                >
                  −
                </button>
                <span className={styles.peopleCount} aria-live="polite">
                  {people}명
                </span>
                <button
                  type="button"
                  className={styles.stepButton}
                  aria-label="인원 늘리기"
                  disabled={people >= MAX_PEOPLE}
                  onClick={() => setPeople(people + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>예산</h2>
            <ChipGroup
              label="예산"
              options={BUDGETS}
              selected={budget ? [budget] : []}
              onToggle={setBudget}
            />
          </section>

          <MoodPhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} />

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>촬영 종류</h2>
            <ChipGroup
              label="촬영 종류"
              options={SHOOT_CATEGORY_NAMES}
              selected={kind ? [kind.category] : []}
              onToggle={changeCategory}
            />
            {kind && subcategories.length > 0 && (
              <>
                <p className={styles.subLabel}>{kind.category} · 세부 종류</p>
                <ChipGroup
                  label={`${kind.category} 세부 종류`}
                  options={subcategories}
                  selected={kind.subcategory ? [kind.subcategory] : []}
                  onToggle={(subcategory) => setKind({ ...kind, subcategory })}
                />
              </>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>분위기</h2>
              <span className={styles.cardHint}>최대 {MAX_MOODS}개 선택</span>
            </div>
            <ChipGroup
              label="분위기"
              options={MOODS}
              selected={moods}
              multiple
              onToggle={toggleMood}
            />
          </section>

          <section className={`${styles.card} ${styles.noteCard}`}>
            <h2 className={styles.cardTitle}>요청 사항 · 선택</h2>
            <label className={styles.noteGuide} htmlFor="request-note">
              꼭 찍고 싶은 컷이 있다면 적어 주세요
            </label>
            <textarea
              id="request-note"
              className={styles.note}
              value={note}
              rows={3}
              maxLength={NOTE_MAX_LENGTH}
              readOnly={aiStatus === 'loading'}
              onChange={(event) => setNote(event.target.value)}
            />
            <span className={styles.counter}>
              {note.length}/{NOTE_MAX_LENGTH}
            </span>
          </section>
        </div>
      </div>

      {openSheet === 'date' && (
        <DatePickerSheet
          title="희망 날짜"
          value={date}
          minDate={toDateKey(addDays(startOfToday(), DATE_MIN_DAYS))}
          maxDate={toDateKey(addMonths(startOfToday(), DATE_MAX_MONTHS))}
          guide="4일 후부터 한 달 안의 날짜를 고를 수 있어요"
          onSelect={changeDate}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {openSheet === 'time' && date !== null && (
        <TimePickerSheet
          date={date}
          value={time}
          onSelect={(next) => {
            setTime(next);
            setTimeReset(false);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {openSheet === 'location' && (
        <RegionPickerSheet
          value={location}
          onSelect={(next) => {
            setLocation(next);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={styles.footer}>
        {photos.length > 0 && (
          <div className={styles.aiBar}>
            <AiFillBar
              status={aiStatus}
              idleMessage="촬영 종류·분위기·요청 사항을 채워드릴게요"
              onFill={fill}
            />
          </div>
        )}
        <div className={styles.bottomBar}>
          <button
            type="button"
            className={styles.nextButton}
            disabled={!canSubmit}
            onClick={goToExperts}
          >
            작가 고르러 가기
          </button>
        </div>
      </div>
    </main>
  );
}
