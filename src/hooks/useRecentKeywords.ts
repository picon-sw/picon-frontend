import { useState } from 'react';

// TODO: 저장 위치(브라우저 / 서버) 정해지면 교체. 지금은 화면 이동 간에만 유지되고 새로고침하면 초기화
let recentKeywordsCache = ['졸업사진', '홍대 프로필', '여권사진', '강아지'];

// 일반검색 · 검색 결과 화면이 함께 쓰는 최근 검색어
export function useRecentKeywords() {
  const [recentKeywords, setRecentKeywords] = useState(recentKeywordsCache);

  const update = (next: string[]) => {
    recentKeywordsCache = next;
    setRecentKeywords(next);
  };

  // 검색한 단어를 맨 위로 (중복 제거)
  const addRecent = (keyword: string) => {
    update([keyword, ...recentKeywordsCache.filter((k) => k !== keyword)]);
  };

  const removeRecent = (keyword: string) => {
    update(recentKeywordsCache.filter((k) => k !== keyword));
  };

  const clearRecent = () => update([]);

  return { recentKeywords, addRecent, removeRecent, clearRecent };
}
