import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import calendarIcon from '../assets/icons/request/calendar-box.svg';
import mapIcon from '../assets/icons/request/map.svg';
import { AiFillBar } from '../components/AiFillBar';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { MoodPhotoPicker } from '../components/MoodPhotoPicker';
import { useAiFill } from '../hooks/useAiFill';
import { useMoodPhotos } from '../hooks/useMoodPhotos';
import { addDays, addMonths, formatMonthDay, startOfToday, toDateKey } from '../utils/date';
import styles from './RequestShootPage.module.css';

const SHOOT_TYPES = ['졸업', '커플', '우정', '여행', '프로필', '기타'] as const;
const BUDGETS = ['5만 원 이하', '5~10만 원', '10만 원 이상'] as const;

type ShootType = (typeof SHOOT_TYPES)[number];
type Budget = (typeof BUDGETS)[number];

const MIN_PEOPLE = 1;
const MAX_PEOPLE = 20;
const ETC_MAX_LENGTH = 20;
const NOTE_MAX_LENGTH = 500;
// 희망 날짜: 오늘 + 3일 ~ 오늘 + 1개월
const DATE_MIN_DAYS = 3;
const DATE_MAX_MONTHS = 1;

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
}

// 칩 단일 선택 (키보드로도 선택되도록 라디오 버튼 역할)
function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div className={styles.chips} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? `${styles.chip} ${styles.chipSelected}` : styles.chip}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function RequestShootPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shootType, setShootType] = useState<ShootType | null>(null);
  const [etcText, setEtcText] = useState('');
  // 희망 날짜는 'YYYY-MM-DD'
  const [date, setDate] = useState<string | null>(null);
  // TODO: 촬영 지역 바텀시트(#29)에서 값 채우기
  const [place] = useState<string | null>(null);
  const [openSheet, setOpenSheet] = useState<'date' | null>(null);
  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { photos, addPhotos, removePhoto } = useMoodPhotos();

  const { status: aiStatus, fill } = useAiFill({
    photos,
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

  const shootTypeDone = shootType !== null && (shootType !== '기타' || etcText.trim() !== '');
  const canSubmit = shootTypeDone && date !== null && place !== null && budget !== null;

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
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>촬영 종류</h2>
            <ChipGroup
              label="촬영 종류"
              options={SHOOT_TYPES}
              value={shootType}
              onChange={setShootType}
            />
            {shootType === '기타' && (
              <input
                className={styles.etcInput}
                type="text"
                value={etcText}
                maxLength={ETC_MAX_LENGTH}
                placeholder="어떤 촬영인지 짧게 적어 주세요"
                aria-label="기타 촬영 종류"
                onChange={(event) => setEtcText(event.target.value)}
              />
            )}
          </section>

          <section className={styles.card} aria-label="촬영 일정">
            <div className={styles.schedule}>
              <button
                type="button"
                className={styles.pick}
                aria-haspopup="dialog"
                onClick={() => setOpenSheet('date')}
              >
                <span className={styles.pickLabel}>희망 날짜</span>
                <span className={styles.pickValue}>
                  <span
                    className={date ? styles.pickText : `${styles.pickText} ${styles.placeholder}`}
                  >
                    {date ? formatMonthDay(date) : '선택해 주세요'}
                  </span>
                  <span className={styles.pickIcon}>
                    <img src={calendarIcon} alt="" />
                  </span>
                </span>
              </button>
              {/* TODO: 촬영 지역 바텀시트 열기 (#29) */}
              <button type="button" className={styles.pick}>
                <span className={styles.pickLabel}>촬영 지역</span>
                <span className={styles.pickValue}>
                  <span className={place ? undefined : styles.placeholder}>
                    {place ?? '선택해 주세요'}
                  </span>
                  <span className={styles.pickIcon}>
                    <img src={mapIcon} alt="" />
                  </span>
                </span>
              </button>
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

          <MoodPhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} />

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>예산</h2>
            <ChipGroup label="예산" options={BUDGETS} value={budget} onChange={setBudget} />
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
          guide="3일 후부터 한 달 안의 날짜를 고를 수 있어요"
          onSelect={(next) => {
            setDate(next);
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
            <AiFillBar photoCount={photos.length} status={aiStatus} onFill={fill} />
          </div>
        )}
        <div className={styles.bottomBar}>
          {/* TODO: 전문가 선택 화면 이동은 Routing 항목에서 */}
          <button type="button" className={styles.nextButton} disabled={!canSubmit}>
            작가 고르러 가기
          </button>
        </div>
      </div>
    </main>
  );
}
