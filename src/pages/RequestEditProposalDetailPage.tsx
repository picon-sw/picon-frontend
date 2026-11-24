import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { getExpert } from '../api/experts';
import {
  fetchEditRequest,
  findEditProposal,
  formatEditPrice,
  sendEditInquiry,
  type EditRequestDetail,
} from '../api/editRequests';
import { InquirySheet } from '../components/InquirySheet';
// 작가 소개 · 포트폴리오 · 견적 카드와 문의·버튼은 촬영 의뢰의 제안 상세와 같은 모양
import profileStyles from './RequestExpertProfilePage.module.css';
import styles from './RequestProposalDetailPage.module.css';

// 편집 의뢰의 작가 제안 상세 (보정 계획 · 편집 견적)
export function RequestEditProposalDetailPage() {
  const { requestId, expertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchEditRequest(Number(requestId)).then((result) => {
      if (!ignore) setDetail(result);
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

  const expert = getExpert(Number(expertId));
  const proposal = detail && expert ? findEditProposal(detail, expert.id) : null;
  const proposalsPath = `/requests/edits/${requestId}/proposals`;

  const goBack = () => {
    if (location.key === 'default') navigate(proposalsPath);
    else navigate(-1);
  };

  const submitInquiry = async (content: string) => {
    if (!detail) return;
    await sendEditInquiry(detail.id, content);
    setInquiryOpen(false);
    setToast('문의를 보냈어요. 답변이 오면 알려 드릴게요');
  };

  const canSelect = detail?.phase === 'open';

  return (
    <main className={profileStyles.page}>
      <header className={profileStyles.header}>
        <button
          type="button"
          className={profileStyles.back}
          aria-label="뒤로 가기"
          onClick={goBack}
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className={profileStyles.title}>{expert ? expert.name : '작가 제안'}</h1>
      </header>

      {detail && expert && proposal ? (
        <div className={profileStyles.content}>
          <section className={profileStyles.profile}>
            <div className={profileStyles.profileRow}>
              {expert.profileImageUrl ? (
                <img className={profileStyles.avatar} src={expert.profileImageUrl} alt="" />
              ) : (
                <span className={`${profileStyles.avatar} ${profileStyles.avatarEmpty}`} />
              )}
              <div className={profileStyles.info}>
                <p className={profileStyles.name}>{expert.name}</p>
                <p className={profileStyles.meta}>
                  ★ {expert.rating.toFixed(1)}&nbsp;&nbsp;후기 {expert.reviewCount} · 평균 작업{' '}
                  {expert.deliveryDays}일
                </p>
              </div>
            </div>
            <p className={profileStyles.introduction}>{expert.introduction}</p>
          </section>

          <ul className={profileStyles.portfolio} aria-label="포트폴리오">
            {expert.profilePortfolio.map(({ id, imageUrl }) => (
              <li
                key={id}
                className={
                  imageUrl
                    ? profileStyles.portfolioItem
                    : `${profileStyles.portfolioItem} ${profileStyles.imageEmpty}`
                }
              >
                {imageUrl && <img src={imageUrl} alt="" />}
              </li>
            ))}
          </ul>

          {/* 이 요청서에 맞춘 보정 계획 */}
          <section className={profileStyles.styleCard}>
            <h2 className={profileStyles.cardTitle}>이렇게 보정해요</h2>
            <ul className={profileStyles.tags} aria-label="보정 항목">
              {proposal.styleTags.map((tag) => (
                <li key={tag} className={profileStyles.tag}>
                  #{tag}
                </li>
              ))}
            </ul>
            <p className={profileStyles.cardText}>{proposal.plan}</p>
          </section>

          <section className={profileStyles.priceCard} aria-label="편집 견적">
            <p className={profileStyles.priceSummary}>
              {formatEditPrice(expert, detail.photos.length)}
            </p>
            <p className={profileStyles.priceDetail}>
              수정 1회 포함 · 결제 후 {proposal.days}일 안에 완료
            </p>
          </section>

          <button type="button" className={styles.inquiryRow} onClick={() => setInquiryOpen(true)}>
            <span className={styles.inquiryQuestion}>{expert.name}에게 궁금한 점이 있나요?</span>
            <span className={styles.inquiryLink}>문의하기 ›</span>
          </button>
        </div>
      ) : (
        detail && <p className={profileStyles.notFound}>제안 정보를 찾을 수 없어요.</p>
      )}

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={`${profileStyles.bottomBar} ${styles.buttons}`}>
        <button type="button" className={styles.secondaryButton} onClick={goBack}>
          이전
        </button>
        {canSelect && expert && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate(`${proposalsPath}/${expert.id}/quote`)}
          >
            이 작가 선택하기
          </button>
        )}
      </div>

      {inquiryOpen && expert && (
        <InquirySheet
          expertName={expert.name}
          answerGuide="답변은 받은 제안 화면과 알림으로 알려 드려요."
          onSubmit={submitInquiry}
          onClose={() => setInquiryOpen(false)}
        />
      )}
    </main>
  );
}
