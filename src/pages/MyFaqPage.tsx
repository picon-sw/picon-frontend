import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronDownIcon from '../assets/icons/explore/chevron-down.svg';
import styles from './MyFaqPage.module.css';

interface Faq {
  question: string;
  answer: string;
}

// TODO: API 연동 또는 기획 확정 시 교체 (지금 앱 기능 기준으로 작성한 임시 질문)
const FAQS: Faq[] = [
  {
    question: '의뢰는 어떻게 하나요?',
    answer:
      '의뢰 탭에서 "의뢰 시작하기"를 누르고 촬영 또는 편집을 고른 뒤 요청서를 작성해 주세요. 전문가를 골라 요청을 보내면 제안을 받을 수 있어요.',
  },
  {
    question: '전문가 제안은 언제 받을 수 있나요?',
    answer:
      '요청을 보낸 전문가가 확인한 뒤 제안을 보내드려요. 도착한 제안은 의뢰 탭의 "나의 의뢰"에서 확인할 수 있어요.',
  },
  {
    question: '결제 · 환불은 어떻게 하나요?',
    answer:
      '결제 · 환불 · 취소 기준은 해당 기능을 도입하기 전에 별도 정책으로 안내해 드릴 예정이에요.',
  },
  {
    question: '콘테스트 투표는 어떻게 하나요?',
    answer:
      '콘테스트 탭에서 진행 중인 콘테스트를 골라 마음에 드는 사진에 투표할 수 있어요. 투표한 내역은 마이페이지 "나의 활동"에서 볼 수 있어요.',
  },
  {
    question: '프로필이나 취향은 어디서 바꾸나요?',
    answer:
      '마이페이지에서 "프로필 정보 수정"을 누르면 프로필을, 내 취향 설정의 "수정"을 누르면 관심 분야와 태그를 바꿀 수 있어요.',
  },
  {
    question: '알림을 끄고 싶어요.',
    answer: '마이페이지 → 설정 및 지원 → 알림 설정에서 알림 종류별로 켜고 끌 수 있어요.',
  },
];

// 자주 묻는 질문 (설정 및 지원 → 자주 묻는 질문)
export function MyFaqPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my/settings" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>자주 묻는 질문</h1>
      </header>

      <ul className={styles.faqList}>
        {FAQS.map(({ question, answer }) => (
          <li key={question}>
            {/* details: 누르면 답변이 펼쳐지는 기본 HTML 요소 */}
            <details className={styles.faq}>
              <summary className={styles.question}>
                <span>
                  <span className={styles.q} aria-hidden="true">
                    Q.
                  </span>
                  {question}
                </span>
                <img className={styles.arrow} src={chevronDownIcon} alt="" />
              </summary>
              <p className={styles.answer}>{answer}</p>
            </details>
          </li>
        ))}
      </ul>

      <p className={styles.more}>
        원하는 답이 없나요?{' '}
        <Link to="/my/settings/support" className={styles.moreLink}>
          고객센터
        </Link>
        로 문의해 주세요.
      </p>
    </main>
  );
}
