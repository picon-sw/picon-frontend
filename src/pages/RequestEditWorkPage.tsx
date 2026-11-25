import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { formatWon, getExpert } from '../api/experts';
import {
  cancelEditRequest,
  CONFIRM_DAYS,
  editDueDate,
  fetchEditRequest,
  formatEditPrice,
  getEditPrice,
  sendEditInquiry,
  type EditRequestDetail,
} from '../api/editRequests';
import { daysUntil } from '../api/proposals';
import { ActionSheet } from '../components/ActionSheet';
import { InquirySheet } from '../components/InquirySheet';
import { formatMonthDay } from '../utils/date';
// 진행 단계 · 정보 카드 모양은 촬영 의뢰의 예약 상세와 같음
import styles from './RequestReservationPage.module.css';

interface Step {
  label: string;
  detail: string;
  done: boolean;
  current?: boolean;
}

// 진행 단계: 결제 완료 → 보정 작업 → 완료 사진 도착 → 확인·수정 요청
function workSteps(detail: EditRequestDetail): Step[] {
  const { phase, paidAt, deliveredAt } = detail;
  const due = editDueDate(detail);
  const paid = {
    label: '결제 완료',
    detail: paidAt ? `${formatMonthDay(paidAt)} 완료` : '완료',
    done: true,
  };
  if (phase === 'revising') {
    return [
      paid,
      { label: '보정 작업', detail: '완료', done: true },
      {
        label: '완료 사진 도착',
        detail: deliveredAt ? `${formatMonthDay(deliveredAt)} 도착` : '도착',
        done: true,
      },
      {
        label: '확인·수정 요청',
        detail: '수정한 사진을 기다리고 있어요',
        done: false,
        current: true,
      },
    ];
  }
  return [
    paid,
    {
      label: '보정 작업',
      detail: phase === 'editing' ? '진행 중' : '시작하면 알려 드려요',
      done: false,
      current: true,
    },
    { label: '완료 사진 도착', detail: due ? `${formatMonthDay(due)} 예정` : '', done: false },
    { label: '확인·수정 요청', detail: `받은 날부터 ${CONFIRM_DAYS}일 안에`, done: false },
  ];
}

const BADGE = { waiting: '작업 대기', editing: '보정 중', revising: '수정 중' };
const MESSAGE = {
  waiting: '곧 작업을 시작해요.',
  editing: '보정 작업을 하고 있어요.',
  revising: '요청하신 수정을 반영하고 있어요.',
};

// 편집 의뢰 작업 상세 (작업 대기 · 보정 중 · 수정 중)
export function RequestEditWorkPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sheet, setSheet] = useState<'inquiry' | 'cancel' | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const goBack = () => {
    if (location.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  const expert = detail?.expertId ? getExpert(detail.expertId) : null;
  const phase = detail?.phase;
  const visible =
    detail && expert && (phase === 'waiting' || phase === 'editing' || phase === 'revising');

  const submitInquiry = async (content: string) => {
    if (!detail) return;
    await sendEditInquiry(detail.id, content);
    setSheet(null);
    setToast('문의를 보냈어요. 답변이 오면 알려 드릴게요');
  };

  const cancel = async () => {
    if (!detail || canceling) return;
    setCanceling(true);
    try {
      await cancelEditRequest(detail.id);
      navigate('/requests', { replace: true });
    } catch {
      setToast('의뢰를 취소하지 못했어요');
      setCanceling(false);
    }
  };

  if (!visible) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={styles.title}>작업 상세</h1>
        </header>
        {loaded && <p className={styles.notFound}>작업 정보를 찾을 수 없어요.</p>}
      </main>
    );
  }

  const photoCount = detail.photos.length;
  const amount = formatWon(getEditPrice(expert, photoCount));
  const due = editDueDate(detail);
  const rows = [
    { label: '사진', value: `${photoCount}장` },
    { label: '보정 강도', value: detail.strength ?? '작가에게 맡김' },
    { label: '보정 항목', value: detail.items.join(', ') || '작가에게 맡김' },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>작업 상세</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.top}>
          <div className={styles.titleRow}>
            <p className={styles.requestTitle}>{detail.title}</p>
            {phase === 'waiting' && <span className={styles.dDay}>시작 전</span>}
            {phase === 'editing' && due && (
              <span className={styles.dDay}>완료 D-{daysUntil(due)}</span>
            )}
          </div>
          <span className={styles.badge}>{BADGE[phase]}</span>
          <div className={styles.expert}>
            {expert.profileImageUrl ? (
              <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
            ) : (
              <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
            )}
            <div className={styles.expertInfo}>
              <p className={styles.expertName}>{expert.name}</p>
              <p className={styles.expertMessage}>{MESSAGE[phase]}</p>
            </div>
          </div>
        </section>

        <ol className={styles.steps} aria-label="진행 단계">
          {workSteps(detail).map(({ label, detail: stepDetail, done, current }) => (
            <li
              key={label}
              className={[styles.step, done && styles.stepDone, current && styles.stepCurrent]
                .filter(Boolean)
                .join(' ')}
              aria-current={current ? 'step' : undefined}
            >
              <span className={styles.stepMarker} aria-hidden="true" />
              <span className={styles.stepInfo}>
                <span className={styles.stepLabel}>{label}</span>
                <span className={styles.stepDetail}>{stepDetail}</span>
              </span>
            </li>
          ))}
        </ol>

        <section className={styles.card} aria-label="편집 정보">
          <h2 className={styles.cardTitle}>편집 정보</h2>
          <dl className={styles.rows}>
            {rows.map(({ label, value }) => (
              <div key={label} className={styles.row}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {detail.note && (
            <>
              <hr className={styles.divider} />
              <p className={styles.text}>요청 사항</p>
              <p className={`${styles.text} ${styles.note}`}>{detail.note}</p>
            </>
          )}
          <hr className={styles.divider} />
          <p className={styles.price}>{formatEditPrice(expert, photoCount)}</p>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>결제</dt>
              <dd>{amount} 결제 완료</dd>
            </div>
          </dl>
        </section>

        {phase === 'waiting' ? (
          <section className={styles.cancelGuide}>
            <p className={styles.text}>작업 시작 전이라 지금 취소하면 {amount} 전액 환불돼요.</p>
            <button type="button" className={styles.cancelLink} onClick={() => setSheet('cancel')}>
              의뢰 취소
            </button>
          </section>
        ) : (
          <section className={styles.cancelGuide}>
            <p className={styles.text}>
              작업이 시작돼 취소할 수 없어요. 문제가 있으면 문의해 주세요.
            </p>
          </section>
        )}
      </div>

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate(`/requests/edits/${detail.id}/inquiries`)}
        >
          문의 내역
        </button>
        <button type="button" className={styles.primaryButton} onClick={() => setSheet('inquiry')}>
          문의하기
        </button>
      </div>

      {sheet === 'inquiry' && (
        <InquirySheet
          expertName={expert.name}
          answerGuide="답변이 오면 알림으로 알려 드려요."
          onSubmit={submitInquiry}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'cancel' && (
        <ActionSheet
          title="의뢰를 취소할까요?"
          description={`${expert.name}에게 취소 알림이 가고,\n맡긴 사진 ${photoCount}장은 바로 삭제돼요.`}
          info={
            <>
              작업 시작 전이라 {amount}을 전액 환불해 드려요.
              <br />
              결제한 수단으로 3~5일 안에 들어와요.
            </>
          }
          buttons={[
            { label: '유지하기', variant: 'secondary', onClick: () => setSheet(null) },
            { label: '의뢰 취소하기', onClick: cancel, disabled: canceling },
          ]}
          onClose={() => setSheet(null)}
        />
      )}
    </main>
  );
}
