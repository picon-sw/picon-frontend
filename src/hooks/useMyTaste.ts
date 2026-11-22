import { useState } from 'react';

export type InterestField = '촬영' | '촬영 및 편집' | '편집';

export interface MyTaste {
  field: InterestField;
  tags: string[];
}

// TODO: API 연동 시 서버의 내 취향으로 교체. 지금은 화면 이동 간에만 유지되고 새로고침하면 초기화
let myTasteCache: MyTaste = {
  field: '촬영',
  tags: ['자연광', '인물', '풍경', '필름'],
};

// 마이페이지 · 내 취향 설정 수정 화면이 함께 쓰는 내 취향 (관심 분야 + 태그)
export function useMyTaste() {
  const [taste, setTaste] = useState(myTasteCache);

  // TODO: API 연동 시 서버에 저장 요청 후 반영
  const saveTaste = (next: MyTaste) => {
    myTasteCache = next;
    setTaste(next);
  };

  return { taste, saveTaste };
}
