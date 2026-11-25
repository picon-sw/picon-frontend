import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import checkboxOffIcon from '../assets/icons/request/checkbox-off.svg';
import checkboxOnIcon from '../assets/icons/request/checkbox-on.svg';
import { formatWon, getExpert } from '../api/experts';
import {
  CONFIRM_DAYS,
  fetchEditRequest,
  findEditProposal,
  formatEditPrice,
  getEditPrice,
  payEdit,
  type EditRequestDetail,
} from '../api/editRequests';
import { PAYMENT_METHODS, type PaymentMethod } from '../api/proposals';
import { PaymentMethodList } from '../components/PaymentMethodList';
// 견적서 모양은 촬영 의뢰의 견적서 확인과 같음
import styles from './RequestQuotePage.module.css';

const AGREEMENTS = [
  '작업 시작 전에 취소하면 전액 환불돼요. 작업이 시작되면 취소할 수 없어요',
  `완료 사진은 받은 날부터 ${CONFIRM_DAYS}일 안에 확인해 주세요. 지나면 자동으로 확인 완료돼요`,
  '수정은 1회까지 요청할 수 있어요',
];

// 편집 의뢰 견적서 확인 · 결제 (결제하면 바로 작업 대기)
export function RequestEditQuotePage() {
  const { requestId, expertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [agreed, setAgreed] = useState<boolean[]>(AGREEMENTS.map(() => false));
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchEditRequest(Number(requestId)).then((result) => {
      if (!ignore) setDetail(result);
    });
    return () => {
      ignore = true;
    };
  }, [requestId]);

  const expert = getExpert(Number(expertId));
  const proposal = detail && expert ? findEditProposal(detail, expert.id) : null;

  const goBack = () => {
    if (location.key === 'default') navigate(`/requests/edits/${requestId}/proposals`);
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

  const photoCount = detail.photos.length;
  const amount = formatWon(getEditPrice(expert, photoCount));
  const allAgreed = agreed.every(Boolean);
  const rows = [
    { label: '사진', value: `${photoCount}장` },
    { label: '보정 강도', value: detail.strength ?? '작가에게 맡김' },
    { label: '보정 항목', value: detail.items.join(', ') || '작가에게 맡김' },
    { label: '완료 예정', value: `결제 후 ${proposal.days}일 안에` },
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
      await payEdit(detail.id, expert.id, method);
      navigate(`/requests/edits/${detail.id}/paid`, { replace: true });
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
          <h2 className={styles.introTitle}>맡길 사진을 확인해요</h2>
          <p className={styles.introText}>보정 정보와 안내 사항을 확인해 주세요.</p>
        </section>

        <section className={`${styles.card} ${styles.cardHighlighted}`} aria-label="편집 정보">
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
          {detail.note && (
            <>
              <hr className={styles.divider} />
              <p className={styles.noteLabel}>요청 사항</p>
              <p className={styles.note}>{detail.note}</p>
            </>
          )}
        </section>

        <section className={styles.card} aria-label="편집 견적">
          <p className={styles.cardTitle}>편집 견적</p>
          <p className={styles.priceSummary}>{formatEditPrice(expert, photoCount)}</p>
          <p className={styles.priceText}>수정 1회 포함</p>
          <p className={styles.priceText}>결제하면 바로 작업을 시작해요</p>
        </section>

        <section className={styles.card} aria-label="결제 수단">
          <p className={styles.cardTitle}>결제 수단</p>
          <PaymentMethodList value={method} onChange={setMethod} />
        </section>

        <section className={styles.agreements} aria-label="꼭 확인해 주세요">
          <p className={styles.cardTitle}>꼭 확인해 주세요</p>
          {AGREEMENTS.map((text, index) => (
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
          {amount} 결제하기
        </button>
      </div>
    </main>
  );
}
