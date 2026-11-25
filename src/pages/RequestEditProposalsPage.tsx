import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkCircleIcon from '../assets/icons/request/check-circle.svg';
import mailIcon from '../assets/icons/request/mail-large.svg';
import moreIcon from '../assets/icons/request/more.svg';
import radioOffIcon from '../assets/icons/request/radio-off.svg';
import { formatWon, getExpert, type Expert } from '../api/experts';
import {
  cancelEditRequest,
  editProposalsWithExperts,
  fetchEditRequest,
  getEditPrice,
  type EditProposal,
  type EditRequestDetail,
} from '../api/editRequests';
import { ActionSheet } from '../components/ActionSheet';
import { formatMonthDay } from '../utils/date';
import { withSubject } from '../utils/korean';
// 카드 모양은 촬영 의뢰의 받은 제안과 같음
import styles from './RequestProposalsPage.module.css';

interface EditProposalCardProps {
  proposal: EditProposal;
  expert: Expert;
  photoCount: number;
  selected: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
}

function EditProposalCard({
  proposal,
  expert,
  photoCount,
  selected,
  onSelect,
  onOpenDetail,
}: EditProposalCardProps) {
  const { name, rating, reviewCount, profileImageUrl, portfolio } = expert;

  return (
    <li
      className={selected ? `${styles.card} ${styles.cardSelected}` : styles.card}
      onClick={onSelect}
    >
      <div className={styles.cardTop}>
        <button
          type="button"
          className={styles.expert}
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetail();
          }}
        >
          {profileImageUrl ? (
            <img className={styles.avatar} src={profileImageUrl} alt="" />
          ) : (
            <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
          )}
          <span className={styles.expertInfo}>
            <span className={styles.nameRow}>
              <span className={styles.name}>{name}</span>
              <span className={styles.detailLink}>상세 보기 ›</span>
            </span>
            <span className={styles.rating}>
              ★ {rating.toFixed(1)}&nbsp;&nbsp;({reviewCount})
            </span>
          </span>
        </button>

        <button
          type="button"
          className={styles.radio}
          role="radio"
          aria-checked={selected}
          aria-label={`${name} 선택`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          <img src={selected ? checkCircleIcon : radioOffIcon} alt="" />
        </button>
      </div>

      {/* 보정 샘플 (지금은 작가 포트폴리오 사진) */}
      <ul
        className={styles.portfolio}
        aria-label={`${name} 보정 샘플`}
        onClick={(event) => {
          event.stopPropagation();
          onOpenDetail();
        }}
      >
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

      <span className={styles.tag}>#{proposal.tag}</span>
      <p className={styles.summary}>{proposal.summary}</p>
      <hr className={styles.divider} />
      <p className={styles.price}>
        {photoCount}장 {formatWon(getEditPrice(expert, photoCount))} · 수정 1회 포함 ·{' '}
        {proposal.days}일 안에 완료
      </p>
    </li>
  );
}

// 편집 의뢰의 받은 제안 (보정 샘플과 견적을 보고 작가 1명 고르기)
export function RequestEditProposalsPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  // 제안 상세에 갔다가 돌아와도 고른 작가가 남도록 화면 기록에 저장해 둔 값
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const state: unknown = location.state;
    return typeof state === 'object' && state !== null && 'selectedId' in state
      ? Number(state.selectedId)
      : null;
  });
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchEditRequest(Number(requestId)).then((result) => {
      if (ignore) return;
      setDetail(result);
      setLoaded(true);
    });
    return () => {
      ignore = true;
    };
  }, [requestId]);

  const goBack = () => {
    if (location.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  const openDetail = (expertId: number) => {
    navigate(location.pathname, { replace: true, state: { selectedId } });
    navigate(`${location.pathname}/${expertId}`);
  };

  const cancelRequest = async () => {
    if (!detail) return;
    await cancelEditRequest(detail.id);
    navigate('/requests', { replace: true });
  };

  const proposals = detail ? editProposalsWithExperts(detail.proposals) : [];
  const open = detail?.phase === 'open';
  // 작가 한 명에게 바로 요청한 경우(촬영 후 편집 맡기기) 그 작가 이름으로 안내
  const directExpert = detail?.requestedIds.length === 1 ? getExpert(detail.requestedIds[0]) : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>받은 제안</h1>
        {open && (
          <button
            type="button"
            className={styles.more}
            aria-label="의뢰 취소"
            onClick={() => setCancelOpen(true)}
          >
            <img src={moreIcon} alt="" />
          </button>
        )}
      </header>

      {detail && open ? (
        <div className={styles.content}>
          <section className={styles.info}>
            <p className={styles.requestTitle}>{detail.title}</p>
            <div className={styles.statusRow}>
              <span className={styles.badge}>제안 {proposals.length}개</span>
              <span className={styles.statusText}>
                {proposals.length > 0
                  ? `${formatMonthDay(detail.selectDeadline)}까지 선택해 주세요`
                  : '24시간 안에 도착해요'}
              </span>
            </div>
          </section>

          {proposals.length === 0 ? (
            <section className={styles.empty}>
              <img src={mailIcon} alt="" />
              <h2 className={styles.emptyTitle}>샘플과 견적을 기다리고 있어요</h2>
              <p className={styles.emptyText}>
                {directExpert ? withSubject(directExpert.name) : '작가가'} 고른 사진을 보고
                <br />
                24시간 안에 보정 샘플과 견적을 보내요.
              </p>
            </section>
          ) : (
            <ul className={styles.list} role="radiogroup">
              {proposals.map(({ proposal, expert }) => (
                <EditProposalCard
                  key={expert.id}
                  proposal={proposal}
                  expert={expert}
                  photoCount={detail.photos.length}
                  selected={selectedId === expert.id}
                  onSelect={() => setSelectedId(expert.id)}
                  onOpenDetail={() => openDetail(expert.id)}
                />
              ))}
            </ul>
          )}
        </div>
      ) : (
        loaded && <p className={styles.notFound}>볼 수 있는 제안이 없어요.</p>
      )}

      {detail && open && proposals.length > 0 && (
        <div className={styles.bottomBar}>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={selectedId === null}
            onClick={() => navigate(`${location.pathname}/${selectedId}/quote`)}
          >
            이 작가에게 맡기기
          </button>
        </div>
      )}

      {cancelOpen && detail && (
        <ActionSheet
          title="의뢰를 취소할까요?"
          description={
            proposals.length > 0
              ? `받은 제안 ${proposals.length}개가 모두 사라지고,\n작가들에게 취소 알림이 가요.`
              : '요청한 작가에게 취소 알림이 가요.'
          }
          info="아직 결제 전이라 취소해도 비용은 들지 않아요."
          buttons={[
            { label: '유지하기', variant: 'secondary', onClick: () => setCancelOpen(false) },
            { label: '의뢰 취소하기', onClick: cancelRequest },
          ]}
          onClose={() => setCancelOpen(false)}
        />
      )}
    </main>
  );
}
