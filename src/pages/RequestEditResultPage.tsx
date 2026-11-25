import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { getExpert } from '../api/experts';
import {
  confirmDeadline,
  confirmEdit,
  fetchEditRequest,
  requestRevision,
  type EditRequestDetail,
} from '../api/editRequests';
import { daysUntil } from '../api/proposals';
import { ActionSheet } from '../components/ActionSheet';
import { formatMonthDay } from '../utils/date';
import styles from './RequestEditResultPage.module.css';

const REVISION_MAX = 300;

type View = 'after' | 'before';

// 완료 사진 확인 (보정 후·전 비교, 확인 완료 또는 수정 요청 1회)
export function RequestEditResultPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<EditRequestDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>('after');
  const [sheet, setSheet] = useState<'confirm' | 'revision' | null>(null);
  const [revision, setRevision] = useState('');
  const [sending, setSending] = useState(false);
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
  const deadline = detail ? confirmDeadline(detail) : null;

  if (!detail || !expert || detail.phase !== 'delivered' || !deadline) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
            <img src={backIcon} alt="" />
          </button>
          <h1 className={styles.title}>완료 사진 확인</h1>
        </header>
        {loaded && <p className={styles.notFound}>확인할 사진이 없어요.</p>}
      </main>
    );
  }

  const count = detail.photos.length;
  // TODO: API 연동 시 보정 후 사진은 작가가 올린 결과물 (지금은 맡긴 사진과 같은 임시 사진)
  const photos = detail.photos;
  const deadlineText = formatMonthDay(deadline);

  const confirm = async () => {
    if (sending) return;
    setSending(true);
    await confirmEdit(detail.id);
    navigate(`/requests/edits/${detail.id}/completed`, { replace: true });
  };

  const sendRevision = async () => {
    if (sending || !revision.trim()) return;
    setSending(true);
    await requestRevision(detail.id, revision.trim());
    navigate(`/requests/edits/${detail.id}/work`, { replace: true });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>완료 사진 확인</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.intro}>
          <div className={styles.introTop}>
            <h2 className={styles.introTitle}>보정한 사진 {count}장이 도착했어요</h2>
            <span className={styles.dDay}>D-{daysUntil(deadline)}</span>
          </div>
          <p className={styles.introText}>
            {detail.revisionUsed
              ? `${deadlineText}까지 확인해 주세요. 수정 요청은 이미 사용했어요.`
              : `${deadlineText}까지 확인하고, 필요하면 수정을 1회 요청할 수 있어요.`}
          </p>
        </section>

        <div className={styles.tabs} role="tablist" aria-label="보정 전후">
          {(['after', 'before'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              className={view === value ? `${styles.tab} ${styles.tabOn}` : styles.tab}
              onClick={() => setView(value)}
            >
              {value === 'after' ? '보정 후' : '보정 전'}
            </button>
          ))}
        </div>

        <p className={styles.count}>전체 {count}</p>
        <ul className={styles.grid}>
          {(view === 'after' ? photos : detail.photos).map((url, index) => (
            <li key={`${view}-${index}`} className={styles.photo}>
              <img
                src={url}
                alt={`${view === 'after' ? '보정 후' : '보정 전'} 사진 ${index + 1}`}
              />
            </li>
          ))}
        </ul>

        <p className={styles.guide}>
          확인 완료를 누르면 원본 화질로 저장할 수 있어요. {deadlineText}이 지나면 자동으로 확인
          완료돼요.
        </p>
      </div>

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}

      <div className={styles.bottomBar}>
        <button
          type="button"
          // 수정 요청을 이미 썼으면 흐리게 보이고, 누르면 안내 토스트
          className={
            detail.revisionUsed
              ? `${styles.secondaryButton} ${styles.secondaryButtonUsed}`
              : styles.secondaryButton
          }
          aria-disabled={detail.revisionUsed}
          onClick={() =>
            detail.revisionUsed
              ? setToast('수정 요청은 1회까지 할 수 있어요')
              : setSheet('revision')
          }
        >
          수정 요청하기
        </button>
        <button type="button" className={styles.primaryButton} onClick={() => setSheet('confirm')}>
          확인 완료
        </button>
      </div>

      {sheet === 'confirm' && (
        <ActionSheet
          title="정말 확정하시겠어요?"
          description={
            detail.revisionUsed
              ? '확정하면 원본 화질로 저장할 수 있어요.'
              : '수정을 1회 더 요청할 수 있어요.\n확정하면 더 이상 수정을 요청할 수 없어요.'
          }
          buttons={[
            { label: '아니요', variant: 'secondary', onClick: () => setSheet(null) },
            { label: '네', onClick: confirm, disabled: sending },
          ]}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'revision' && (
        <ActionSheet
          title="수정 요청하기"
          description={`${expert.name}에게 1회 수정을 요청할 수 있어요.\n수정한 사진은 보통 하루 안에 도착해요.`}
          buttons={[
            {
              label: '수정 요청 보내기',
              onClick: sendRevision,
              disabled: !revision.trim() || sending,
            },
          ]}
          onClose={() => setSheet(null)}
        >
          <label className={styles.revision}>
            <span className={styles.revisionLabel}>수정할 내용</span>
            <textarea
              className={styles.textarea}
              value={revision}
              maxLength={REVISION_MAX}
              placeholder="예) 2번 사진은 눈 밑을 조금 더 자연스럽게 해 주세요."
              onChange={(event) => setRevision(event.target.value)}
            />
            <span className={styles.counter}>
              {revision.length}/{REVISION_MAX}
            </span>
          </label>
        </ActionSheet>
      )}
    </main>
  );
}
