import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { getExpert } from '../api/experts';
import { fetchEditRequest, sendEditInquiry } from '../api/editRequests';
import { fetchShootRequest, sendInquiry, type Inquiry } from '../api/proposals';
import { InquirySheet } from '../components/InquirySheet';
import { formatMonthDay } from '../utils/date';
import styles from './RequestInquiriesPage.module.css';

interface InquiryTarget {
  id: number;
  title: string;
  expertId?: number;
  inquiries: Inquiry[];
}

// 촬영 의뢰(예약한 작가) · 편집 의뢰(맡긴 작가)의 문의 목록
async function fetchInquiryTarget(
  kind: 'shoot' | 'edit',
  id: number,
): Promise<InquiryTarget | null> {
  if (kind === 'edit') {
    const detail = await fetchEditRequest(id);
    return detail
      ? { id, title: detail.title, expertId: detail.expertId, inquiries: [...detail.inquiries] }
      : null;
  }
  const detail = await fetchShootRequest(id);
  return detail
    ? {
        id,
        title: detail.title,
        expertId: detail.reservedExpertId,
        inquiries: [...detail.inquiries],
      }
    : null;
}

interface RequestInquiriesPageProps {
  kind?: 'shoot' | 'edit';
}

// 예약한(맡긴) 작가에게 남긴 문의와 답변
export function RequestInquiriesPage({ kind = 'shoot' }: RequestInquiriesPageProps) {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<InquiryTarget | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchInquiryTarget(kind, Number(requestId)).then((result) => {
      if (ignore) return;
      setDetail(result);
      setLoaded(true);
    });
    return () => {
      ignore = true;
    };
  }, [kind, requestId]);

  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else if (kind === 'edit') navigate(`/requests/edits/${requestId}/work`);
    else navigate(`/requests/${requestId}/reservation`);
  };

  const expert = detail?.expertId ? getExpert(detail.expertId) : null;

  // 보낸 문의를 목록 맨 위에 바로 보여 줌
  const submitInquiry = async (content: string) => {
    if (!detail || !expert) return;
    if (kind === 'edit') await sendEditInquiry(detail.id, content);
    else await sendInquiry(detail.id, expert.id, content);
    setDetail(await fetchInquiryTarget(kind, detail.id));
    setSheetOpen(false);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>문의 내역</h1>
      </header>

      {detail && expert ? (
        <div className={styles.content}>
          <section className={styles.target}>
            <p className={styles.targetTitle}>
              {expert.name} · {detail.title}
            </p>
            <p className={styles.targetText}>
              문의 {detail.inquiries.length}건 · 답변은 보통 하루 안에 와요
            </p>
          </section>

          {detail.inquiries.length === 0 ? (
            <p className={styles.empty}>아직 남긴 문의가 없어요.</p>
          ) : (
            <ul className={styles.list}>
              {detail.inquiries.map(({ id, question, askedAt, answer }) => (
                <li key={id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span
                      className={answer ? styles.badge : `${styles.badge} ${styles.badgeWaiting}`}
                    >
                      {answer ? '답변 완료' : '답변 대기'}
                    </span>
                    <span className={styles.date}>{formatMonthDay(askedAt)}</span>
                  </div>
                  <p className={styles.question}>
                    <span className={styles.mark}>Q</span>
                    <span>{question}</span>
                  </p>
                  {answer ? (
                    <div className={styles.answer}>
                      <p className={styles.answerTop}>
                        <span className={styles.mark}>A</span>
                        <span className={styles.answerMeta}>
                          {expert.name} · {formatMonthDay(answer.answeredAt)}
                        </span>
                      </p>
                      <p className={styles.answerText}>{answer.content}</p>
                    </div>
                  ) : (
                    <p className={styles.waiting}>
                      작가가 확인하고 있어요. 답변이 오면 알림으로 알려 드릴게요.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        loaded && <p className={styles.notFound}>문의 내역을 찾을 수 없어요.</p>
      )}

      {expert && (
        <div className={styles.bottomBar}>
          <button type="button" className={styles.primaryButton} onClick={() => setSheetOpen(true)}>
            문의하기
          </button>
        </div>
      )}

      {sheetOpen && expert && (
        <InquirySheet
          expertName={expert.name}
          answerGuide="답변이 오면 알림으로 알려 드려요."
          onSubmit={submitInquiry}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </main>
  );
}
