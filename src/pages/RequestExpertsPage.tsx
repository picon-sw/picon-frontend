import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkIcon from '../assets/icons/request/check.svg';
import clockIcon from '../assets/icons/request/clock-large.svg';
import {
  fetchAvailableExperts,
  formatSlot,
  formatStartPrice,
  type AvailableExperts,
  type Expert,
  type NearbySlot,
} from '../api/experts';
import { formatLocation } from '../api/places';
import {
  formatShootSchedule,
  readExpertsState,
  sendRequest,
  type RequestDoneState,
  type RequestExpertsState,
  type RequestSummary,
} from '../api/requests';
import styles from './RequestExpertsPage.module.css';

const MAX_SELECTION = 5;

// 주소로 바로 들어와서 요청서 화면에서 넘겨받은 정보가 없을 때 보여 줄 임시 데이터
const SAMPLE_SUMMARY: RequestSummary = {
  title: '경의선책거리 스냅',
  detail: '10월 20일 (화) 14:00 · 마포구 경의선책거리 · 촬영 인원 3명',
};

const TYPE_GUIDE = {
  shoot: '확인 후 촬영 계획과 견적서를 보내요. 촬영 후 구매한 사진은 골라서 편집을 맡길 수 있어요.',
  edit: '확인 후 보정 샘플 1장과 견적서를 보내요.',
};

interface ExpertCardProps {
  expert: Expert;
  selected: boolean;
  onToggle: () => void;
  onOpenProfile: () => void;
}

function ExpertCard({ expert, selected, onToggle, onOpenProfile }: ExpertCardProps) {
  const { name, rating, reviewCount, profileImageUrl, portfolio } = expert;

  return (
    <li
      className={selected ? `${styles.card} ${styles.cardSelected}` : styles.card}
      onClick={onToggle}
    >
      <div className={styles.cardTop}>
        {profileImageUrl ? (
          <img className={styles.avatar} src={profileImageUrl} alt="" />
        ) : (
          <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
        )}

        <div className={styles.info}>
          <p className={styles.name}>{name}</p>
          <p className={styles.meta}>
            <span>
              ★ {rating.toFixed(1)} ({reviewCount}) · {formatStartPrice(expert)}
            </span>
            <button
              type="button"
              className={styles.profileLink}
              onClick={(event) => {
                event.stopPropagation();
                onOpenProfile();
              }}
            >
              프로필 보기
            </button>
          </p>
        </div>

        {/* 선택 전: 빈 동그라미 / 선택 후: ✓ 선택됨 */}
        <button
          type="button"
          className={selected ? `${styles.select} ${styles.selectOn}` : styles.selectCircle}
          aria-pressed={selected}
          aria-label={`${name} ${selected ? '선택 해제' : '선택'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          {selected && (
            <>
              <img src={checkIcon} alt="" />
              선택됨
            </>
          )}
        </button>
      </div>

      <ul className={styles.portfolio} aria-label={`${name} 포트폴리오`}>
        {portfolio.map(({ id, imageUrl }) => (
          <li
            key={id}
            className={
              imageUrl ? styles.portfolioItem : `${styles.portfolioItem} ${styles.imageEmpty}`
            }
          >
            {imageUrl && <img src={imageUrl} alt="" />}
          </li>
        ))}
      </ul>
    </li>
  );
}

interface NoExpertsProps {
  // 예: 10월 20일 (화) 14:00 마포구
  condition: string;
  nearby: NearbySlot[];
  onPickSlot: (slot: NearbySlot) => void;
}

// 요청서 조건에 맞는 작가가 없을 때: 가까운 시간 추천
function NoExperts({ condition, nearby, onPickSlot }: NoExpertsProps) {
  return (
    <section className={styles.noExperts}>
      <span className={styles.noExpertsIcon}>
        <img src={clockIcon} alt="" />
      </span>
      <h2 className={styles.noExpertsTitle}>이 시간에 가능한 작가가 없어요</h2>
      <p className={styles.noExpertsText}>
        {condition}에서 촬영할 수 있는
        <br />
        작가가 없어요. 가까운 시간에는 가능한 작가가 있어요.
      </p>
      <ul className={styles.slots} aria-label="가까운 시간">
        {nearby.map((slot) => (
          <li key={`${slot.date} ${slot.time}`}>
            <button type="button" className={styles.slot} onClick={() => onPickSlot(slot)}>
              <span className={styles.slotTime}>{formatSlot(slot)}</span>
              <span className={styles.slotCount}>작가 {slot.expertCount}명</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RequestExpertsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageState = readExpertsState(location.state);
  const summary = pageState?.summary ?? SAMPLE_SUMMARY;
  const form = pageState?.form;
  const kind = pageState?.kind ?? (form || !pageState ? 'shoot' : 'edit');
  const excludeIds = pageState?.excludeIds;
  const [result, setResult] = useState<AvailableExperts | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>(pageState?.selectedIds ?? []);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 요청서 조건이 바뀌면(가까운 시간 선택 등) 목록을 다시 받아 옴
  useEffect(() => {
    let ignore = false;
    fetchAvailableExperts(form, excludeIds, kind).then((next) => {
      if (!ignore) setResult(next);
    });
    return () => {
      ignore = true;
    };
  }, [form, excludeIds, kind]);

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

  const toggleExpert = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    if (selectedIds.length >= MAX_SELECTION) {
      setToast(`최대 ${MAX_SELECTION}명까지 고를 수 있어요`);
      return;
    }
    setSelectedIds([...selectedIds, id]);
  };

  const currentState = (): RequestExpertsState => ({
    summary,
    kind,
    form,
    excludeIds,
    selectedIds,
  });

  // 프로필을 보고 뒤로 돌아와도 고른 전문가가 남도록 지금 화면 state에 저장해 두고 이동
  const openProfile = (id: number) => {
    navigate(location.pathname, { replace: true, state: currentState() });
    navigate(`/requests/new/experts/${id}`);
  };

  // 추천 시간을 고르면 요청서의 날짜·시간을 바꿔서 다시 찾음
  const pickSlot = (slot: NearbySlot) => {
    if (!form) return;
    const nextForm = { ...form, date: slot.date, time: slot.time };
    const state: RequestExpertsState = {
      ...currentState(),
      form: nextForm,
      summary: {
        ...summary,
        detail: `${formatShootSchedule(slot.date, slot.time)} · ${formatLocation(form.location)} · 촬영 인원 ${form.people}명`,
      },
      selectedIds: [],
    };
    setSelectedIds([]);
    navigate(location.pathname, { replace: true, state });
  };

  const experts = result?.kind === 'available' ? result.experts : [];

  // 뒤로 가기로 전문가 선택 화면에 다시 들어오지 않도록 replace 이동
  const send = async () => {
    if (selectedIds.length === 0 || sending) return;
    setSending(true);
    try {
      await sendRequest(selectedIds);
      const state: RequestDoneState = {
        summary,
        experts: experts
          .filter(({ id }) => selectedIds.includes(id))
          .map(({ id, name, profileImageUrl }) => ({ id, name, profileImageUrl })),
        kind,
      };
      navigate('/requests/done', { replace: true, state });
    } catch {
      setToast('요청을 보내지 못했어요');
      setSending(false);
    }
  };

  const selectedCount = selectedIds.length;
  const noExperts = result?.kind === 'none';

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>전문가 선택</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.summary}>
          <p className={styles.summaryTitle}>{summary.title}</p>
          <p className={styles.summaryDetail}>{summary.detail}</p>
        </section>

        {result?.kind === 'none' && form ? (
          <NoExperts
            condition={`${formatShootSchedule(form.date, form.time)} ${form.location.sigungu}`}
            nearby={result.nearby}
            onPickSlot={pickSlot}
          />
        ) : (
          <>
            {excludeIds && excludeIds.length > 0 && (
              <div className={styles.reRequest} role="status">
                <p className={styles.reRequestTitle}>같은 조건으로 작가를 다시 찾았어요</p>
                <p className={styles.reRequestText}>
                  이미 요청한 작가 {excludeIds.length}명은 빼고 보여 드려요.
                </p>
              </div>
            )}

            <section className={styles.guide}>
              <div className={styles.guideTop}>
                <h2 className={styles.guideTitle}>전문가</h2>
                <span className={styles.count} aria-live="polite">
                  선택한 전문가 {selectedCount}/{MAX_SELECTION}
                </span>
              </div>
              <p className={styles.guideText}>
                {kind === 'edit' ? '보정 전후 사진을' : '포트폴리오를'} 참고해 전문가를 선택해
                주세요. (최대 {MAX_SELECTION}명)
              </p>
            </section>

            <ul className={styles.list}>
              {experts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  selected={selectedIds.includes(expert.id)}
                  onToggle={() => toggleExpert(expert.id)}
                  onOpenProfile={() => openProfile(expert.id)}
                />
              ))}
            </ul>

            <div className={styles.typeGuide}>
              <p>{TYPE_GUIDE[kind]}</p>
            </div>
          </>
        )}
      </div>

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={styles.bottomBar}>
        {noExperts ? (
          <button type="button" className={styles.sendButton} onClick={goBack}>
            날짜·시간 바꾸기
          </button>
        ) : (
          <button
            type="button"
            className={styles.sendButton}
            disabled={selectedCount === 0 || sending}
            onClick={send}
          >
            {selectedCount === 0
              ? '전문가를 선택해 주세요'
              : `선택한 ${selectedCount}명에게 요청 보내기`}
          </button>
        )}
      </div>
    </main>
  );
}
