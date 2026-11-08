import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkIcon from '../assets/icons/request/check.svg';
import styles from './RequestExpertsPage.module.css';

const MAX_SELECTION = 5;

interface Expert {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  // 최소 가격 (원)
  minPrice: number;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  profileImageUrl?: string;
  portfolio: { id: number; imageUrl?: string }[];
}

interface RequestSummary {
  title: string;
  // 촬영: 날짜 · 장소 · 인원 / 편집: 보정 항목 · 장수
  detail: string;
}

const SAMPLE_PORTFOLIO = [{ id: 1 }, { id: 2 }, { id: 3 }];

// TODO: 요청서 화면에서 넘겨받은 정보로 교체 (임시 데이터)
const REQUEST_SUMMARY: RequestSummary = {
  title: '서울숲 우정 스냅',
  detail: '10월 20일 · 서울숲 · 촬영 인원 3명',
};

// TODO: API 연동 시 교체 (임시 데이터 — 서버가 연관성 높은 순으로 내려준 목록을 그대로 표시)
const EXPERTS: Expert[] = [
  { id: 1, name: '김하늘 작가', rating: 4.9, reviewCount: 32, minPrice: 89000 },
  { id: 2, name: '윤슬 작가', rating: 4.8, reviewCount: 24, minPrice: 79000 },
  { id: 3, name: '민서 작가', rating: 4.9, reviewCount: 41, minPrice: 85000 },
  { id: 4, name: '서하 작가', rating: 4.7, reviewCount: 18, minPrice: 70000 },
  { id: 5, name: '무드필름', rating: 4.8, reviewCount: 56, minPrice: 95000 },
  { id: 6, name: '이젤 작가', rating: 4.6, reviewCount: 12, minPrice: 60000 },
].map((expert) => ({ ...expert, portfolio: SAMPLE_PORTFOLIO }));

interface ExpertCardProps {
  expert: Expert;
  selected: boolean;
  onToggle: () => void;
}

function ExpertCard({ expert, selected, onToggle }: ExpertCardProps) {
  const { name, rating, reviewCount, minPrice, profileImageUrl, portfolio } = expert;

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
              ★ {rating.toFixed(1)} ({reviewCount}) · {minPrice.toLocaleString('ko-KR')}원~
            </span>
            {/* TODO: 작가 프로필 화면 이동은 Routing 항목에서 */}
            <button
              type="button"
              className={styles.profileLink}
              onClick={(event) => event.stopPropagation()}
            >
              프로필 보기
            </button>
          </p>
        </div>

        <button
          type="button"
          className={selected ? `${styles.select} ${styles.selectOn}` : styles.select}
          aria-pressed={selected}
          aria-label={`${name} ${selected ? '선택 해제' : '선택'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          {selected && <img src={checkIcon} alt="" />}
          {selected ? '선택됨' : '선택'}
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

export function RequestExpertsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);

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

  const selectedCount = selectedIds.length;

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
          <p className={styles.summaryTitle}>{REQUEST_SUMMARY.title}</p>
          <p className={styles.summaryDetail}>{REQUEST_SUMMARY.detail}</p>
        </section>

        <section className={styles.guide}>
          <div className={styles.guideTop}>
            <h2 className={styles.guideTitle}>전문가</h2>
            <span className={styles.count} aria-live="polite">
              선택한 전문가 {selectedCount}/{MAX_SELECTION}
            </span>
          </div>
          <p className={styles.guideText}>
            포트폴리오를 참고해 전문가를 선택해 주세요. (최대 {MAX_SELECTION}명)
          </p>
        </section>

        {EXPERTS.length > 0 ? (
          <ul className={styles.list}>
            {EXPERTS.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                selected={selectedIds.includes(expert.id)}
                onToggle={() => toggleExpert(expert.id)}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>조건에 맞는 전문가가 없어요.</p>
            <button type="button" className={styles.editButton} onClick={goBack}>
              요청서 수정하기
            </button>
          </div>
        )}

        <div className={styles.typeGuide}>
          <p>사진 편집만: 확인 후 샘플과 견적서를 보내요.</p>
          <p>
            촬영·촬영+편집: 확인 후 촬영 계획과 견적서를 보내요. 편집은 촬영 후 받은 사진에서 골라
            바로 요청해요.
          </p>
        </div>
      </div>

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={styles.bottomBar}>
        {/* TODO: 요청서 발송 후 요청 완료 화면 이동은 Routing 항목에서 */}
        <button type="button" className={styles.sendButton} disabled={selectedCount === 0}>
          선택한 {selectedCount}명에게 요청 보내기
        </button>
      </div>
    </main>
  );
}
