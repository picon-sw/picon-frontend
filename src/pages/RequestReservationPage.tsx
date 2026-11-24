import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { formatExpertPrice, formatWon, getExpert, type Expert } from '../api/experts';
import {
  CANCEL_REASONS,
  cancelReservation,
  daysUntil,
  fetchShootRequest,
  formatDeposit,
  formatRefundDeadline,
  getPhotoPrice,
  getRefund,
  pickDeadlineOf,
  reRequestTarget,
  sendInquiry,
  type CancelReason,
  type ShootRequestDetail,
} from '../api/proposals';
import { formatShootSchedule } from '../api/requests';
import { ActionSheet } from '../components/ActionSheet';
import { InquirySheet } from '../components/InquirySheet';
import { formatShootKind } from '../constants/requestOptions';
import { addDays, formatMonthDay, fromDateKey, toDateKey } from '../utils/date';
import styles from './RequestReservationPage.module.css';

interface Step {
  label: string;
  detail: string;
  done: boolean;
  // 지금 해야 할 단계 (사진 도착 후 사진 고르기·구매)
  current?: boolean;
}

// 진행 단계: 예약 확정 → 촬영 → 사진 도착 → 사진 고르기·구매
function reservationSteps(detail: ShootRequestDetail, expert: Expert): Step[] {
  const { form, reservedAt, delivery } = detail;
  const confirmed = {
    label: '예약 확정',
    detail: reservedAt ? `${formatMonthDay(reservedAt)} 완료` : '완료',
    done: true,
  };
  if (delivery) {
    return [
      confirmed,
      { label: '촬영', detail: `${formatMonthDay(form.date)} 완료`, done: true },
      { label: '사진 도착', detail: `${formatMonthDay(delivery.arrivedAt)} 도착`, done: true },
      {
        label: '사진 고르기·구매',
        detail: `${formatMonthDay(pickDeadlineOf(delivery.arrivedAt))}까지`,
        done: false,
        current: true,
      },
    ];
  }
  const arriveDate = toDateKey(addDays(fromDateKey(form.date), expert.deliveryDays));
  return [
    confirmed,
    { label: '촬영', detail: `${formatMonthDay(form.date)} 예정`, done: false },
    { label: '사진 도착', detail: `${formatMonthDay(arriveDate)} 예정`, done: false },
    { label: '사진 고르기·구매', detail: '사진 도착 후', done: false },
  ];
}

interface ReservationInfoProps {
  detail: ShootRequestDetail;
  expert: Expert;
  depositText: string;
}

// 예약 정보 카드 (예약 확정 · 작가 취소 공통)
function ReservationInfo({ detail, expert, depositText }: ReservationInfoProps) {
  const { form } = detail;
  const rows = [
    { label: '날짜 · 시간', value: `${formatShootSchedule(form.date, form.time)} · 1시간` },
    { label: '지역 · 인원', value: `${form.location.detail} · ${form.people}명` },
    { label: '촬영 종류', value: formatShootKind(form.kind) },
    { label: '분위기', value: form.moods.join(', ') },
  ];

  return (
    <section className={styles.card} aria-label="예약 정보">
      <h2 className={styles.cardTitle}>예약 정보</h2>
      <dl className={styles.rows}>
        {rows.map(({ label, value }) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {form.note && (
        <>
          <hr className={styles.divider} />
          <p className={styles.text}>요청 사항</p>
          <p className={`${styles.text} ${styles.note}`}>{form.note}</p>
        </>
      )}
      <hr className={styles.divider} />
      <p className={styles.price}>{formatExpertPrice(expert)}</p>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>예약금</dt>
          <dd>{depositText}</dd>
        </div>
      </dl>
    </section>
  );
}

export function RequestReservationPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sheet, setSheet] = useState<'inquiry' | 'cancel' | null>(null);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const goBack = () => {
    if (location.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  const expert = detail?.reservedExpertId ? getExpert(detail.reservedExpertId) : null;
  const phase = detail?.phase;
  const visible =
    detail &&
    expert &&
    (phase === 'reserved' || phase === 'expertCanceled' || phase === 'photosArrived');
  // 예약 확정 · 사진 도착은 같은 진행 화면 (작가 취소만 다름)
  const active = phase === 'reserved' || phase === 'photosArrived';
  const delivery = detail?.delivery;

  const submitInquiry = async (content: string) => {
    if (!detail || !expert) return;
    await sendInquiry(detail.id, expert.id, content);
    setSheet(null);
    setToast('문의를 보냈어요. 답변이 오면 알려 드릴게요');
  };

  const cancel = async () => {
    if (!detail || !reason || canceling) return;
    setCanceling(true);
    try {
      await cancelReservation(detail.id, reason);
      navigate('/requests', { replace: true });
    } catch {
      setToast('예약을 취소하지 못했어요');
      setCanceling(false);
    }
  };

  // 작가 취소: 같은 조건으로 다른 작가 찾기 (취소한 작가는 뺌)
  const requestAgain = () => {
    if (!detail || !expert) return;
    const { to, state } = reRequestTarget(detail, [expert.id]);
    navigate(to, { state });
  };

  const refund = detail && expert ? getRefund(detail.form, expert) : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>예약 상세</h1>
      </header>

      {visible ? (
        <div className={styles.content}>
          <section className={styles.top}>
            <div className={styles.titleRow}>
              <p className={styles.requestTitle}>{detail.title}</p>
              {phase === 'reserved' && (
                <span className={styles.dDay}>촬영 D-{daysUntil(detail.form.date)}</span>
              )}
              {phase === 'photosArrived' && delivery && (
                <span className={styles.dDay}>
                  고르기 D-{daysUntil(pickDeadlineOf(delivery.arrivedAt))}
                </span>
              )}
            </div>
            <span className={active ? styles.badge : `${styles.badge} ${styles.badgeCanceled}`}>
              {phase === 'reserved'
                ? '예약 확정'
                : phase === 'photosArrived'
                  ? '사진 도착'
                  : '작가 취소'}
            </span>
            <div className={styles.expert}>
              {expert.profileImageUrl ? (
                <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
              )}
              <div className={styles.expertInfo}>
                <p className={styles.expertName}>{expert.name}</p>
                <p className={styles.expertMessage}>
                  {phase === 'reserved' && '함께할 순간을 준비하고 있어요.'}
                  {phase === 'photosArrived' &&
                    `사진 ${delivery?.photos.length ?? 0}장을 보냈어요.`}
                  {phase === 'expertCanceled' && '작가 사정으로 예약이 취소됐어요.'}
                </p>
              </div>
            </div>
          </section>

          {active ? (
            <ol className={styles.steps} aria-label="진행 단계">
              {reservationSteps(detail, expert).map(
                ({ label, detail: stepDetail, done, current }) => (
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
                ),
              )}
            </ol>
          ) : (
            <section className={styles.canceledBox}>
              <p className={styles.canceledTitle}>{expert.name}가 예약을 취소했어요</p>
              <p className={styles.canceledText}>
                예약금 {formatDeposit(expert)}은 전액 환불돼요. 결제한 수단으로 3~5일 안에 들어와요.
                <br />
                같은 조건으로 다른 작가를 바로 찾아 드려요.
              </p>
            </section>
          )}

          {phase === 'photosArrived' && delivery && (
            <section className={styles.pickGuide}>
              <p className={styles.pickTitle}>사진 {delivery.photos.length}장이 도착했어요</p>
              <p className={styles.pickText}>
                {formatMonthDay(pickDeadlineOf(delivery.arrivedAt))}까지 마음에 드는 사진을 골라
                주세요.
                <br />
                지나면 작가 추천 10장으로 자동 구매되고,
                <br />
                예약금을 뺀 {formatWon(getPhotoPrice(expert, 10).toPay)}이 결제돼요.
              </p>
              <button
                type="button"
                className={styles.pickButton}
                onClick={() => navigate(`/requests/${detail.id}/photos`)}
              >
                사진 고르러 가기
              </button>
            </section>
          )}

          <ReservationInfo
            detail={detail}
            expert={expert}
            depositText={`${formatDeposit(expert)} ${active ? '결제 완료' : '전액 환불'}`}
          />

          {phase === 'reserved' && (
            <section className={styles.cancelGuide}>
              <p className={styles.text}>
                {formatRefundDeadline(detail.form)}까지 취소하면 예약금 전액 환불돼요
              </p>
              <button
                type="button"
                className={styles.cancelLink}
                onClick={() => setSheet('cancel')}
              >
                예약 취소
              </button>
            </section>
          )}
        </div>
      ) : (
        loaded && <p className={styles.notFound}>예약 정보를 찾을 수 없어요.</p>
      )}

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      {visible && (
        <div className={styles.bottomBar}>
          {active ? (
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(`/requests/${detail.id}/inquiries`)}
              >
                문의 내역
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setSheet('inquiry')}
              >
                문의하기
              </button>
            </>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={requestAgain}>
              다른 작가에게도 요청하기
            </button>
          )}
        </div>
      )}

      {sheet === 'inquiry' && expert && (
        <InquirySheet
          expertName={expert.name}
          answerGuide="답변이 오면 알림으로 알려 드려요."
          onSubmit={submitInquiry}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'cancel' && refund && (
        <ActionSheet
          title="예약을 취소할까요?"
          description={
            refund.full
              ? `지금 취소하면 예약금 ${formatWon(refund.amount)}을 전액 환불해 드려요`
              : `환불 기한이 지나 예약금의 50%인 ${formatWon(refund.amount)}을 환불해 드려요`
          }
          buttons={[
            { label: '유지하기', variant: 'secondary', onClick: () => setSheet(null) },
            { label: '취소하기', onClick: cancel, disabled: reason === null || canceling },
          ]}
          onClose={() => setSheet(null)}
        >
          <div className={styles.reasons}>
            <p className={styles.reasonsTitle}>취소 사유</p>
            <div className={styles.reasonChips} role="radiogroup" aria-label="취소 사유">
              {CANCEL_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={reason === item}
                  className={
                    reason === item
                      ? `${styles.reasonChip} ${styles.reasonChipOn}`
                      : styles.reasonChip
                  }
                  onClick={() => setReason(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </ActionSheet>
      )}
    </main>
  );
}
