// 공지사항 (공지 목록 · 상세 화면에서 사용)
// TODO: API 연동 시 서버의 공지사항으로 교체 (지금은 공지할 내용이 없어 임시 문구)

export interface Notice {
  id: number;
  title: string;
  content: string;
  // YYYY.MM.DD
  date: string;
  // 고정 글은 목록 맨 위 + 압정 표시
  pinned: boolean;
}

const TEST_MESSAGE = 'PIC:ON 공지사항 테스트입니다.';

export const NOTICES: Notice[] = [
  { id: 1, title: TEST_MESSAGE, content: TEST_MESSAGE, date: '2026.11.20', pinned: true },
  { id: 2, title: TEST_MESSAGE, content: TEST_MESSAGE, date: '2026.11.15', pinned: false },
  { id: 3, title: TEST_MESSAGE, content: TEST_MESSAGE, date: '2026.11.08', pinned: false },
];

// 고정 글 먼저, 그다음 최신순 (날짜 문자열 YYYY.MM.DD는 그대로 비교해도 순서가 맞음)
export function sortNotices(notices: Notice[]) {
  return [...notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date),
  );
}
