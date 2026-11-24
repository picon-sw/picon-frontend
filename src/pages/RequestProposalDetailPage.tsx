import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { formatExpertPrice, getExpert } from '../api/experts';
import {
  fetchShootRequest,
  findProposal,
  sendInquiry,
  type ShootRequestDetail,
} from '../api/proposals';
import { ActionSheet } from '../components/ActionSheet';
// 작가 소개 · 포트폴리오 · 견적 카드는 작가 프로필 화면과 같은 모양
import profileStyles from './RequestExpertProfilePage.module.css';
import styles from './RequestProposalDetailPage.module.css';

const INQUIRY_MAX_LENGTH = 300;

export function RequestProposalDetailPage() {
  const { requestId, expertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<ShootRequestDetail | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiry, setInquiry] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchShootRequest(Number(requestId)).then((result) => {
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
  const proposal = detail && expert ? findProposal(detail, expert.id) : null;
  const proposalsPath = `/requests/${requestId}/proposals`;

  // 받은 제안으로 돌아가기. 주소로 바로 들어온 경우(이전 화면 없음)는 받은 제안 주소로
  const goBack = () => {
    if (location.key === 'default') navigate(proposalsPath);
    else navigate(-1);
  };

  const submitInquiry = async () => {
    const content = inquiry.trim();
    if (!detail || !expert || !content || sending) return;
    setSending(true);
    try {
      await sendInquiry(detail.id, expert.id, content);
      setInquiryOpen(false);
      setInquiry('');
      setToast('문의를 보냈어요. 답변이 오면 알려 드릴게요');
    } catch {
      setToast('문의를 보내지 못했어요');
    } finally {
      setSending(false);
    }
  };

  // 제안을 고를 수 있을 때만 '이 작가 선택하기' (제안 마감이면 보기만)
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

      {expert && proposal ? (
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
                  ★ {expert.rating.toFixed(1)}&nbsp;&nbsp;후기 {expert.reviewCount} · 평균 전달{' '}
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

          {/* 이 요청서에 맞춘 촬영 계획 */}
          <section className={profileStyles.styleCard}>
            <h2 className={profileStyles.cardTitle}>이렇게 촬영해요</h2>
            <ul className={profileStyles.tags} aria-label="분위기">
              {proposal.styleTags.map((tag) => (
                <li key={tag} className={profileStyles.tag}>
                  #{tag}
                </li>
              ))}
            </ul>
            <p className={profileStyles.cardText}>{proposal.plan}</p>
          </section>

          <section className={profileStyles.priceCard} aria-label="견적">
            <p className={profileStyles.priceSummary}>{formatExpertPrice(expert)}</p>
            <p className={profileStyles.priceDetail}>촬영 1시간 · 원본·보정 1회 포함</p>
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
        <ActionSheet
          title="작가에게 문의하기"
          description={`${expert.name}에게 궁금한 점을 남겨 주세요.\n답변은 받은 제안 화면과 알림으로 알려 드려요.`}
          buttons={[
            {
              label: '문의 보내기',
              onClick: submitInquiry,
              disabled: inquiry.trim().length === 0 || sending,
            },
          ]}
          onClose={() => setInquiryOpen(false)}
        >
          <label className={styles.field}>
            <span className={styles.fieldLabel}>문의 내용</span>
            <textarea
              className={styles.textarea}
              value={inquiry}
              maxLength={INQUIRY_MAX_LENGTH}
              placeholder="촬영 장소, 준비물 등 궁금한 점을 적어 주세요"
              onChange={(event) => setInquiry(event.target.value)}
            />
            <span className={styles.counter}>
              {inquiry.length}/{INQUIRY_MAX_LENGTH}
            </span>
          </label>
        </ActionSheet>
      )}
    </main>
  );
}
