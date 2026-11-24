import type { Budget, ShootKind } from '../constants/requestOptions';
import { formatMonthDay } from '../utils/date';
import type { ShootLocation } from './places';

// ---- AI 채우기 (참고 사진을 보고 요청서 일부를 채워 줌) ----
// TODO: API 나오면 client.post('/requests/draft', ...)로 교체 (임시 응답, 1.2초 뒤 고정 값)

// 편집 요청서: 요청 사항 문장
export async function fetchEditDraft(photoCount: number): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return `참고 사진 ${photoCount}장처럼 따뜻하고 부드러운 색감으로 맞춰 주세요. 피부는 자연스럽게 정리하고, 과한 보정 없이 원본 느낌을 살려 주세요.`;
}

export interface ShootDraft {
  kind: ShootKind;
  moods: string[];
  note: string;
}

// 촬영 요청서: 촬영 종류 · 분위기 · 요청 사항
export async function fetchShootDraft(photoCount: number): Promise<ShootDraft> {
  void photoCount;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    kind: { category: '인물', subcategory: '관계' },
    moods: ['밝음', '자연스러움'],
    note: '자연광 아래에서 따뜻하고 부드러운 색감으로 찍고 싶어요. 자연스럽게 웃는 순간을 많이 담아 주세요.',
  };
}

// ---- 의뢰 화면 사이에 넘기는 값 (react-router location.state) ----
// 주소로 바로 들어오면 state가 없으므로, 받는 화면은 read*State가 null이면 임시 데이터를 보여 줌

// 전문가 선택 · 요청 완료 화면 위쪽 요청서 카드
export interface RequestSummary {
  title: string;
  // 촬영: 날짜 · 장소 · 인원 / 편집: 보정 항목 · 강도 · 장수
  detail: string;
}

// 예: 10월 20일 (화) 14:00
export function formatShootSchedule(date: string, time: string): string {
  return `${formatMonthDay(date)} ${time}`;
}

// 촬영 요청서에 적은 값 (전문가 선택 조건, 견적서 요약에 사용)
export interface ShootRequestForm {
  // 'YYYY-MM-DD'
  date: string;
  // 'HH:mm'
  time: string;
  location: ShootLocation;
  people: number;
  budget: Budget;
  kind: ShootKind;
  moods: string[];
  note: string;
}

// 요청서 → 전문가 선택
// TODO: API 나오면 요청서 저장 응답의 requestId를 담아 전문가 목록 요청·요청 보내기에 사용
export interface RequestExpertsState {
  summary: RequestSummary;
  // 촬영 요청서 값 (편집 요청서는 없음)
  form?: ShootRequestForm;
  // 작가 프로필을 보고 돌아왔을 때 고른 전문가를 유지하려고 담아 둠
  selectedIds?: number[];
}

export interface SentExpert {
  id: number;
  name: string;
  profileImageUrl?: string;
}

// 전문가 선택 → 요청 완료
export interface RequestDoneState {
  summary: RequestSummary;
  experts: SentExpert[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSummary(value: unknown): value is RequestSummary {
  return isRecord(value) && typeof value.title === 'string' && typeof value.detail === 'string';
}

export function readExpertsState(state: unknown): RequestExpertsState | null {
  if (!isRecord(state) || !isSummary(state.summary)) return null;
  const selectedIds = Array.isArray(state.selectedIds)
    ? state.selectedIds.filter((id): id is number => typeof id === 'number')
    : undefined;
  // form은 이 앱의 요청서 화면이 넘긴 값이라 모양만 간단히 확인
  const form =
    isRecord(state.form) && typeof state.form.date === 'string'
      ? (state.form as unknown as ShootRequestForm)
      : undefined;
  return { summary: state.summary, form, selectedIds };
}

export function readDoneState(state: unknown): RequestDoneState | null {
  if (!isRecord(state) || !isSummary(state.summary) || !Array.isArray(state.experts)) return null;
  const experts = state.experts.filter(
    (expert): expert is SentExpert =>
      isRecord(expert) && typeof expert.id === 'number' && typeof expert.name === 'string',
  );
  return { summary: state.summary, experts };
}

// TODO: API 나오면 이 함수 안만 client.post(`/requests/${requestId}/send`, { expertIds }) 등으로 교체
// 지금은 임시 응답 (0.5초 뒤 항상 성공)
export async function sendRequest(expertIds: number[]): Promise<void> {
  void expertIds;
  await new Promise((resolve) => setTimeout(resolve, 500));
}
