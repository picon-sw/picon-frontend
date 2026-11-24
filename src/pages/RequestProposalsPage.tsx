import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkCircleIcon from '../assets/icons/request/check-circle.svg';
import mailIcon from '../assets/icons/request/mail-large.svg';
import moreIcon from '../assets/icons/request/more.svg';
import radioOffIcon from '../assets/icons/request/radio-off.svg';
import { formatExpertPrice, type Expert } from '../api/experts';
import {
  cancelShootRequest,
  fetchShootRequest,
  reRequestTarget,
  withExperts,
  type Proposal,
  type ShootRequestDetail,
} from '../api/proposals';
import { ActionSheet } from '../components/ActionSheet';
import { formatMonthDay } from '../utils/date';
import styles from './RequestProposalsPage.module.css';

interface ProposalCardProps {
  proposal: Proposal;
  expert: Expert;
  // 고를 수 없는 상태(제안 마감)면 undefined
  selected?: boolean;
  onSelect?: () => void;
  onOpenDetail: () => void;
}

function ProposalCard({ proposal, expert, selected, onSelect, onOpenDetail }: ProposalCardProps) {
  const { name, rating, reviewCount, profileImageUrl, portfolio } = expert;
  const selectable = onSelect !== undefined;

  return (
    <li
      className={selected ? `${styles.card} ${styles.cardSelected}` : styles.card}
      onClick={selectable ? onSelect : onOpenDetail}
    >
      <div className={styles.cardTop}>
        {/* 이름·프로필·포트폴리오를 눌러도 제안 상세로 이동 */}
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

        {selectable && (
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
        )}
      </div>

      <ul
        className={styles.portfolio}
        aria-label={`${name} 포트폴리오`}
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
      <p className={styles.price}>{formatExpertPrice(expert)}</p>
    </li>
  );
}

// 받은 제안 화면 오른쪽 위 안내
function statusText(detail: ShootRequestDetail): string {
  if (detail.phase === 'expired') return '제안 기간이 끝났어요';
  if (detail.phase === 'closed') return '제안 마감(미선택)';
  return `${formatMonthDay(detail.selectDeadline)}까지 선택해 주세요`;
}

export function RequestProposalsPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
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
    fetchShootRequest(Number(requestId)).then((result) => {
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
    await cancelShootRequest(detail.id);
    navigate('/requests', { replace: true });
  };

  // 같은 조건으로 다시 요청 (이미 요청한 작가는 빼고, 처음엔 아무도 선택 안 됨)
  const requestAgain = () => {
    if (!detail) return;
    const { to, state } = reRequestTarget(detail, detail.requestedIds);
    navigate(to, { state });
  };

  const proposals = detail ? withExperts(detail.proposals) : [];
  const phase = detail?.phase;
  const canCancel = phase === 'open' || phase === 'expired';
  const requestedCount = detail?.requestedIds.length ?? 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>받은 제안</h1>
        {canCancel && (
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

      {detail && (phase === 'open' || phase === 'expired' || phase === 'closed') ? (
        <div className={styles.content}>
          <section className={styles.info}>
            <p className={styles.requestTitle}>{detail.title}</p>
            <div className={styles.statusRow}>
              <span
                className={
                  proposals.length > 0 ? styles.badge : `${styles.badge} ${styles.badgeEmpty}`
                }
              >
                제안 {proposals.length}개
              </span>
              <span className={styles.statusText}>{statusText(detail)}</span>
            </div>
            {proposals.length > 0 && proposals.length < requestedCount && (
              <p className={styles.partial}>
                요청한 {requestedCount}명 중 {proposals.length}명이 제안을 보냈어요
              </p>
            )}
          </section>

          {phase === 'expired' ? (
            <section className={styles.empty}>
              <img src={mailIcon} alt="" />
              <h2 className={styles.emptyTitle}>24시간 동안 제안이 오지 않았어요</h2>
              <p className={styles.emptyText}>
                같은 조건으로 다른 작가를 바로 찾아 드려요.
                <br />
                이미 요청한 작가는 빼고 보여 드려요.
              </p>
            </section>
          ) : (
            <ul className={styles.list} role={phase === 'open' ? 'radiogroup' : undefined}>
              {proposals.map(({ proposal, expert }) => (
                <ProposalCard
                  key={expert.id}
                  proposal={proposal}
                  expert={expert}
                  selected={phase === 'open' ? selectedId === expert.id : undefined}
                  onSelect={phase === 'open' ? () => setSelectedId(expert.id) : undefined}
                  onOpenDetail={() => openDetail(expert.id)}
                />
              ))}
            </ul>
          )}
        </div>
      ) : (
        loaded && <p className={styles.notFound}>볼 수 있는 제안이 없어요.</p>
      )}

      {detail && (
        <div className={styles.bottomBar}>
          {phase === 'open' && (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={selectedId === null}
              onClick={() => navigate(`${location.pathname}/${selectedId}/quote`)}
            >
              이 작가로 예약하기
            </button>
          )}
          {phase === 'expired' && (
            <button type="button" className={styles.primaryButton} onClick={requestAgain}>
              다른 작가에게도 요청하기
            </button>
          )}
          {phase === 'closed' && (
            <button type="button" className={styles.primaryButton} onClick={requestAgain}>
              같은 조건으로 다시 요청하기
            </button>
          )}
        </div>
      )}

      {cancelOpen && detail && (
        <ActionSheet
          title="의뢰를 취소할까요?"
          description={
            proposals.length > 0
              ? `받은 제안 ${proposals.length}개가 모두 사라지고,\n작가들에게 취소 알림이 가요.`
              : '요청한 작가들에게 취소 알림이 가요.'
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
