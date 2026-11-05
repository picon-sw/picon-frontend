// 탐색 검색 필터 (일반검색 · 검색 결과 화면 공통)

export type ExploreFilterKey = 'field' | 'region' | 'price' | 'career';

// 선택한 값 목록. 하나만 고르는 필터도 배열(최대 1개)로 통일
export type ExploreFilters = Partial<Record<ExploreFilterKey, string[]>>;

interface ExploreFilterDefinition {
  key: ExploreFilterKey;
  label: string;
  options: string[];
  // true면 여러 개 선택 가능
  multiple?: boolean;
}

export const EXPLORE_FILTERS: ExploreFilterDefinition[] = [
  { key: 'field', label: '분야', options: ['촬영', '편집'] },
  {
    key: 'region',
    label: '지역',
    multiple: true,
    options: [
      '서울',
      '인천',
      '경기도',
      '강원도',
      '충청북도',
      '충청남도',
      '대전',
      '세종',
      '전라북도',
      '전라남도',
      '광주',
      '경상북도',
      '경상남도',
      '대구',
      '울산',
      '부산',
      '제주도',
    ],
  },
  {
    key: 'price',
    label: '가격',
    options: ['5만원 이하', '5~10만원', '10~15만원', '15~20만원', '20만원 이상'],
  },
  {
    key: 'career',
    label: '경력',
    options: ['1년 미만', '3년 미만', '5년 미만', '10년 미만', '10년 이상'],
  },
];

// URL(?region=서울&region=인천&price=...)에서 필터 읽기. 선택지에 없는 값은 무시, 선택지 순서로 정렬
export function readExploreFilters(params: URLSearchParams): ExploreFilters {
  const filters: ExploreFilters = {};
  for (const { key, options, multiple } of EXPLORE_FILTERS) {
    const values = params.getAll(key);
    const selected = options.filter((option) => values.includes(option));
    if (selected.length > 0) filters[key] = multiple ? selected : selected.slice(0, 1);
  }
  return filters;
}

// 검색어 + 필터를 URL 쿼리 문자열로 (여러 개 선택한 필터는 같은 이름으로 반복)
export function toExploreSearchParams(filters: ExploreFilters, q?: string): URLSearchParams {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  for (const { key } of EXPLORE_FILTERS) {
    for (const value of filters[key] ?? []) params.append(key, value);
  }
  return params;
}
