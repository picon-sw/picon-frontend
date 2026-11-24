import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkboxOffIcon from '../assets/icons/request/checkbox-off.svg';
import checkboxOnIcon from '../assets/icons/request/checkbox-on.svg';
import { formatExpertPrice, getExpert } from '../api/experts';
import { formatLocation } from '../api/places';
import {
  fetchShootRequest,
  findProposal,
  formatDeposit,
  formatRefundDeadline,
  payDeposit,
  PAYMENT_METHODS,
  type PaymentMethod,
  type ShootRequestDetail,
} from '../api/proposals';
import { formatShootSchedule } from '../api/requests';
import { PaymentMethodList } from '../components/PaymentMethodList';
import { formatShootKind } from '../constants/requestOptions';
import styles from './RequestQuotePage.module.css';

export function RequestQuotePage() {
  const { requestId, expertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [agreed, setAgreed] = useState<boolean[]>([false, false, false]);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchShootRequest(Number(requestId)).then((result) => {
      if (!ignore) setDetail(result);
    });
    return () => {
      ignore = true;
    };
  }, [requestId]);

  const expert = getExpert(Number(expertId));
  const proposal = detail && expert ? findProposal(detail, expert.id) : null;

  const goBack = () => {
    if (location.key === 'default') navigate(`/requests/${requestId}/proposals`);
    else navigate(-1);
  };

  if (!detail || !expert || !proposal) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={styles.title}>견적서 확인</h1>
        </header>
        {detail && <p className={styles.notFound}>견적서를 찾을 수 없어요.</p>}
      </main>
    );
  }

  const { form } = detail;
  const deposit = formatDeposit(expert);
  // 동의 3개를 모두 체크해야 결제 가능
  const agreements = [
    `${formatRefundDeadline(form)}까지 취소하면 예약금 전액, 이후엔 50%를 환불해 드려요`,
    '15분 이상 늦으면 촬영 시간이 줄어들어요',
    '사진은 받은 날부터 7일 안에 골라야 해요. 지나면 작가 추천 10장으로 자동 구매돼요',
  ];
  const allAgreed = agreed.every(Boolean);
  const rows = [
    { label: '날짜 · 시간', value: `${formatShootSchedule(form.date, form.time)} · 1시간` },
    { label: '지역', value: formatLocation(form.location) },
    { label: '인원', value: `${form.people}명` },
    { label: '촬영 종류', value: formatShootKind(form.kind) },
    { label: '분위기', value: form.moods.join(', ') },
  ];

  const toggleAgreement = (index: number) => {
    setAgreed(agreed.map((value, i) => (i === index ? !value : value)));
  };

  // 뒤로 가기로 견적서에 다시 들어오지 않도록 replace 이동
  const pay = async () => {
    if (!allAgreed || paying) return;
    setPaying(true);
    setError(null);
    try {
      await payDeposit(detail.id, expert.id, method);
      navigate(`/requests/${detail.id}/reserved`, { replace: true });
    } catch {
      setError('결제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setPaying(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>견적서 확인</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.intro}>
          <h2 className={styles.introTitle}>설레는 순간을 예약해요</h2>
          <p className={styles.introText}>촬영 정보와 안내 사항을 확인해 주세요.</p>
        </section>

        <section className={`${styles.card} ${styles.cardHighlighted}`} aria-label="촬영 정보">
          <p className={styles.cardTitle}>{detail.title}</p>
          <div className={styles.expert}>
            {expert.profileImageUrl ? (
              <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
            ) : (
              <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
            )}
            <div className={styles.expertInfo}>
              <p className={styles.expertName}>{expert.name}</p>
              <p className={styles.expertTag}>#{proposal.tag}</p>
            </div>
          </div>
          <hr className={styles.divider} />
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
              <p className={styles.noteLabel}>요청 사항</p>
              <p className={styles.note}>{form.note}</p>
            </>
          )}
        </section>

        <section className={styles.card} aria-label="촬영 견적">
          <p className={styles.cardTitle}>촬영 견적</p>
          <p className={styles.priceSummary}>{formatExpertPrice(expert)}</p>
          <p className={styles.priceText}>촬영 1시간 · 원본·보정 1회 포함</p>
          <p className={styles.priceText}>예약금 {deposit} · 사진 구매 금액에서 빼 드려요</p>
        </section>

        <section className={styles.card} aria-label="결제 수단">
          <p className={styles.cardTitle}>결제 수단</p>
          <PaymentMethodList value={method} onChange={setMethod} />
        </section>

        <section className={styles.agreements} aria-label="꼭 확인해 주세요">
          <p className={styles.cardTitle}>꼭 확인해 주세요</p>
          {agreements.map((text, index) => (
            <button
              key={text}
              type="button"
              role="checkbox"
              aria-checked={agreed[index]}
              className={styles.agreement}
              onClick={() => toggleAgreement(index)}
            >
              <img src={agreed[index] ? checkboxOnIcon : checkboxOffIcon} alt="" />
              <span>{text}</span>
            </button>
          ))}
        </section>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.payButton}
          disabled={!allAgreed || paying}
          onClick={pay}
        >
          예약금 {deposit} 결제하기
        </button>
      </div>
    </main>
  );
}
