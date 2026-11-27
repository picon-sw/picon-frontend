import { Link, useParams } from 'react-router';
import megaphoneIcon from '../assets/icons/my/megaphone.svg';
import pinIcon from '../assets/icons/my/pin.svg';
import { NOTICES } from '../constants/notices';
import { PageHeader } from '../components/PageHeader';
import styles from './MyNoticesPage.module.css';

// 공지사항 상세 (/my/settings/notices/:noticeId)
export function MyNoticeDetailPage() {
  const { noticeId } = useParams();
  // TODO: API 연동 시 id로 공지 요청
  const notice = NOTICES.find(({ id }) => String(id) === noticeId);

  return (
    <main className={styles.page}>
      <PageHeader title="공지사항" backTo="/my/settings/notices" />

      {notice ? (
        <article className={styles.detail}>
          <div className={styles.detailHead}>
            <img
              className={styles.icon}
              src={notice.pinned ? pinIcon : megaphoneIcon}
              alt={notice.pinned ? '고정 공지' : '공지'}
            />
            <div className={styles.cardText}>
              <h2 className={styles.detailTitle}>{notice.title}</h2>
              <time className={styles.date}>{notice.date}</time>
            </div>
          </div>
          <p className={styles.content}>{notice.content}</p>
        </article>
      ) : (
        <div className={styles.notFound}>
          <p>공지사항을 찾을 수 없어요.</p>
          <Link to="/my/settings/notices">공지사항 목록으로 돌아가기</Link>
        </div>
      )}
    </main>
  );
}
