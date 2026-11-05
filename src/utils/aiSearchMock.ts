// AI 검색 임시 로직
// TODO: 백엔드 AI API(/api 경유) 연동 시 교체. 지금은 문장에서 간단한 규칙으로 조건을 뽑고, 빠진 조건만 순서대로 물어봄

import { EXPLORE_FILTERS } from '../constants/exploreFilters';

export interface AiConditions {
  field: '촬영' | '편집';
  service?: string;
  region?: string;
  budget?: string;
}

export type AiQuestion = 'budget' | 'region' | 'regionDetail';

export const NO_PREFERENCE = '상관없음';
export const SEOUL_WHOLE = '서울 전체';
export const SEOUL_DETAIL = '세부 지역 선택';

export const BUDGET_OPTIONS = ['10만원 이하', '10~20만원 이하', '20만원 이상', NO_PREFERENCE];
export const REGION_OPTIONS = ['서울', '경기도', '인천', '부산', NO_PREFERENCE];
export const SEOUL_DETAIL_OPTIONS = [SEOUL_WHOLE, SEOUL_DETAIL];

export const SEOUL_DISTRICTS = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
];

const REGIONS = EXPLORE_FILTERS.find(({ key }) => key === 'region')?.options ?? [];

// [문장에 들어 있으면, 조건 이름] — 앞에 있을수록 먼저 찾음
const SERVICE_KEYWORDS: [string, string][] = [
  ['졸업', '졸업사진'],
  ['증명', '증명사진'],
  ['취업', '취업사진'],
  ['여권', '여권사진'],
  ['바디프로필', '바디프로필'],
  ['프로필', '프로필사진'],
  ['웨딩', '웨딩사진'],
  ['가족', '가족사진'],
  ['커플', '커플사진'],
  ['우정', '우정사진'],
  ['반려', '반려동물 사진'],
  ['강아지', '반려동물 사진'],
  ['돌잔치', '돌사진'],
  ['만삭', '만삭사진'],
  ['제품', '제품사진'],
  ['행사', '행사사진'],
  ['스냅', '스냅사진'],
];

// 마지막 글자에 받침이 있으면 true (을/를, 으로/로 고르기)
function hasBatchim(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

export function withObject(word: string) {
  return `${word}${hasBatchim(word) ? '을' : '를'}`;
}

function withRo(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  // 받침이 없거나 ㄹ 받침이면 '로'
  const noRo = code < 0 || code > 11171 || code % 28 === 0 || code % 28 === 8;
  return `${word}${noRo ? '로' : '으로'}`;
}

function parseRegion(message: string) {
  const district = SEOUL_DISTRICTS.find(
    (d) => message.includes(d) || message.includes(d.slice(0, -1)),
  );
  if (district) return `서울 ${district}`;
  return REGIONS.find((region) => message.includes(region.replace(/도$/, '')));
}

function parseBudget(message: string) {
  const range = message.match(/(\d+)\s*~\s*(\d+)\s*만/);
  if (range) return `${range[1]}~${range[2]}만원`;
  const single = message.match(/(\d+)\s*만\s*원?\s*(이상|이하|미만|까지)?/);
  if (single) return `${single[1]}만원 ${single[2] === '이상' ? '이상' : '이하'}`;
  return undefined;
}

export function parseConditions(message: string): AiConditions {
  return {
    field: /편집|보정|리터칭/.test(message) ? '편집' : '촬영',
    service: SERVICE_KEYWORDS.find(([keyword]) => message.includes(keyword))?.[1],
    region: parseRegion(message),
    budget: parseBudget(message),
  };
}

// 아직 안 물어본 빠진 조건 중 다음 질문
export function nextQuestion(conditions: AiConditions, asked: AiQuestion[]): AiQuestion | null {
  if (!conditions.budget && !asked.includes('budget')) return 'budget';
  if (!conditions.region && !asked.includes('region')) return 'region';
  if (conditions.region === '서울' && !asked.includes('regionDetail')) return 'regionDetail';
  return null;
}

export function questionText(question: AiQuestion) {
  if (question === 'budget') return '예산은 어느 정도 생각하고 계신가요?';
  if (question === 'region') return '어느 지역에서 찾으시나요?';
  return '서울에서 어느 지역을 선호하시나요?';
}

export function questionOptions(question: AiQuestion) {
  if (question === 'budget') return BUDGET_OPTIONS;
  if (question === 'region') return REGION_OPTIONS;
  return SEOUL_DETAIL_OPTIONS;
}

// 화면에 보여줄 지역 이름 ("서울" → "서울 전체")
export function regionLabel(region?: string) {
  if (!region || region === NO_PREFERENCE) return undefined;
  return REGIONS.includes(region) ? `${region} 전체` : region;
}

function budgetLabel(budget?: string) {
  return budget && budget !== NO_PREFERENCE ? budget : undefined;
}

// 처음 문장을 받았을 때 첫 마디
export function greetingText({ service, region, field }: AiConditions) {
  const where = regionLabel(region)?.replace(/ 전체$/, '');
  if (service && where)
    return `${where}에서 ${withObject(service)} ${field}할 작가를 찾고 계시군요!`;
  if (service) return `${withObject(service)} ${field}할 작가를 찾고 계시군요!`;
  if (where) return `${where}에서 ${field}할 작가를 찾고 계시군요!`;
  return '원하시는 조건으로 작가를 찾아볼게요!';
}

// 답을 고른 뒤 맞장구
export function answerAckText(question: AiQuestion, answer: string) {
  if (answer === NO_PREFERENCE) {
    return question === 'budget' ? '예산은 상관없으시군요!' : '지역은 상관없으시군요!';
  }
  if (question === 'budget') return `${withRo(answer.replace('만원', '만 원'))} 찾으시는군요!`;
  return `${answer}에서 찾으시는군요!`;
}

// 조건 요약 문장 ("서울에서 10만 원 이하로 졸업사진을 촬영할 수 있는 작가")
export function conditionSentence({ service, region, budget, field }: AiConditions) {
  const parts: string[] = [];
  const where = regionLabel(region)?.replace(/ 전체$/, '');
  if (where) parts.push(`${where}에서`);
  const price = budgetLabel(budget);
  if (price) parts.push(withRo(price.replace('만원', '만 원')));
  if (service) parts.push(withObject(service));
  parts.push(`${field}할 수 있는 작가`);
  return parts.join(' ');
}

// 결과 화면에 보여줄 조건 칩
export function conditionChips(conditions: AiConditions) {
  return [
    conditions.service,
    regionLabel(conditions.region),
    budgetLabel(conditions.budget),
  ].filter((value): value is string => Boolean(value));
}

export function toConditionParams(conditions: AiConditions) {
  const params = new URLSearchParams({ field: conditions.field });
  if (conditions.service) params.set('service', conditions.service);
  if (conditions.region) params.set('region', conditions.region);
  if (conditions.budget) params.set('budget', conditions.budget);
  return params;
}

export function readConditionParams(params: URLSearchParams): AiConditions {
  return {
    field: params.get('field') === '편집' ? '편집' : '촬영',
    service: params.get('service') ?? undefined,
    region: params.get('region') ?? undefined,
    budget: params.get('budget') ?? undefined,
  };
}
