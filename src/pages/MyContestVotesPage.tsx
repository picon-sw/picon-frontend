import { useState } from 'react';
import heartFilledIcon from '../assets/icons/my/heart-filled.svg';
import { PageHeader } from '../components/PageHeader';
import { SegmentTabs } from '../components/SegmentTabs';
import { DEMO_MY_VOTE_IMAGES } from '../constants/demoImages';
import styles from './MyContestVotesPage.module.css';

type ContestCategory = 'shoot' | 'edit';

interface VotedWork {
  id: number;
  title: string;
  author: string;
  votes: number;
  // 카드 아래 오른쪽 안내 (11.20 투표, 1위 수상, 미수상 등)
  note: string;
  awarded: boolean;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  imageUrl?: string;
}

interface ContestVoteGroup {
  id: number;
  category: ContestCategory;
  // NOVEMBER CONTEST
  eyebrow: string;
  title: string;
  // 진행 중이면 D-day, 끝났으면 종료
  status: { label: string; ongoing: boolean };
  info: string;
  works: VotedWork[];
}

// TODO: API 연동 시 교체 (임시 데이터 — Figma 예시, 사진은 시연용)
const SAMPLE_GROUPS: ContestVoteGroup[] = [
  {
    id: 11,
    category: 'shoot',
    eyebrow: 'NOVEMBER CONTEST',
    title: '11월 콘테스트 · 주제 「빛」',
    status: { label: 'D-8', ongoing: true },
    info: '남은 투표권 1장 · 결과 발표 12.01',
    works: [
      {
        id: 1,
        title: '가을 오후의 빛',
        author: '하린',
        votes: 128,
        note: '11.20 투표',
        awarded: false,
        imageUrl: DEMO_MY_VOTE_IMAGES[0],
      },
      {
        id: 2,
        title: '창가의 아침',
        author: '유나',
        votes: 96,
        note: '11.18 투표',
        awarded: false,
        imageUrl: DEMO_MY_VOTE_IMAGES[1],
      },
    ],
  },
  {
    id: 10,
    category: 'shoot',
    eyebrow: 'OCTOBER CONTEST',
    title: '10월 콘테스트 · 주제 「거리」',
    status: { label: '종료', ongoing: false },
    info: '투표 2회 · 내가 투표한 작품 1개 수상',
    works: [
      {
        id: 3,
        title: '비 오는 골목',
        author: '지우',
        votes: 412,
        note: '1위 수상',
        awarded: true,
        imageUrl: DEMO_MY_VOTE_IMAGES[2],
      },
      {
        id: 4,
        title: '퇴근길',
        author: '민재',
        votes: 205,
        note: '미수상',
        awarded: false,
        imageUrl: DEMO_MY_VOTE_IMAGES[3],
      },
    ],
  },
];

const CATEGORY_TABS: { value: ContestCategory; label: string }[] = [
  { value: 'shoot', label: '촬영 부문' },
  { value: 'edit', label: '편집 부문' },
];

// 콘테스트 투표 내역 (나의 활동 → 콘테스트 투표 내역)
export function MyContestVotesPage() {
  const [category, setCategory] = useState<ContestCategory>('shoot');
  const groups = SAMPLE_GROUPS.filter((group) => group.category === category);

  return (
    <main className={styles.page}>
      <PageHeader title="콘테스트 투표 내역" backTo="/my/activity" />
      <SegmentTabs
        tabs={CATEGORY_TABS}
        value={category}
        onChange={setCategory}
        label="콘테스트 부문"
      />

      {groups.length > 0 ? (
        groups.map(({ id, eyebrow, title, status, info, works }) => (
          <section key={id} className={styles.group} aria-label={title}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <div className={styles.titleRow}>
              <h2 className={styles.groupTitle}>{title}</h2>
              <span className={status.ongoing ? styles.statusOngoing : styles.statusEnded}>
                {status.label}
              </span>
            </div>
            <p className={styles.info}>{info}</p>

            <ul className={styles.grid}>
              {works.map((work) => (
                <li key={work.id} className={styles.work}>
                  <div className={styles.imageWrap}>
                    {work.imageUrl && <img className={styles.image} src={work.imageUrl} alt="" />}
                    <span className={work.awarded ? styles.badgeAwarded : styles.badgeVoted}>
                      {work.awarded ? '수상작' : '투표 완료'}
                    </span>
                  </div>
                  <p className={styles.workTitle}>{work.title}</p>
                  <p className={styles.author}>by {work.author}</p>
                  <p className={styles.votes}>
                    <img src={heartFilledIcon} alt="" />
                    <strong>{work.votes}표</strong>
                    <span>· {work.note}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className={styles.empty}>투표한 작품이 없어요.</p>
      )}
    </main>
  );
}
