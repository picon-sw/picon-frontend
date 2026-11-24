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

// 촬영 요청서 화면에 다시 돌아왔을 때 채울 값 (history state에 저장)
// 날짜·시간은 비워서 넘길 수 있음 (촬영일이 가까워 다시 고르게 할 때)
export interface ShootFormDraft extends Omit<ShootRequestForm, 'date' | 'time'> {
  date: string | null;
  time: string | null;
  // 참고 사진 파일은 history state에 넣으면 브라우저가 버릴 수 있어서 메모리에 두고 key만 저장
  photoKey?: string;
  // 날짜·시간 칸 아래 안내 (예: 촬영일이 가까워 날짜와 시간을 다시 골라 주세요)
  notice?: string;
  // 같은 조건으로 다시 요청할 때 이미 요청한 작가 (전문가 선택에서 뺌)
  excludeIds?: number[];
}

// 앱을 새로고침하기 전까지만 유지 (새로고침하면 사진은 다시 올려야 함)
const draftPhotos = new Map<string, File[]>();

export function saveDraftPhotos(files: File[]): string {
  const key = crypto.randomUUID();
  draftPhotos.set(key, files);
  return key;
}

export function loadDraftPhotos(key: string | undefined): File[] {
  return key ? (draftPhotos.get(key) ?? []) : [];
}

export function readShootFormDraft(state: unknown): ShootFormDraft | null {
  if (!isRecord(state) || !isRecord(state.draft)) return null;
  const draft = state.draft;
  return isRecord(draft.location) ? (draft as unknown as ShootFormDraft) : null;
}

// 요청서 → 전문가 선택
// TODO: API 나오면 요청서 저장 응답의 requestId를 담아 전문가 목록 요청·요청 보내기에 사용
export interface RequestExpertsState {
  summary: RequestSummary;
  // 요청서 종류 (없으면 form이 있으면 촬영, 없으면 편집으로 봄)
  kind?: 'shoot' | 'edit';
  // 촬영 요청서 값 (편집 요청서는 없음)
  form?: ShootRequestForm;
  // 같은 조건으로 다시 요청할 때 이미 요청한 작가 (목록에서 뺌)
  excludeIds?: number[];
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
  // 편집이면 '보정 샘플과 견적' 안내 (없으면 촬영)
  kind?: 'shoot' | 'edit';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumbers(value: unknown): number[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === 'number')
    : undefined;
}

function isSummary(value: unknown): value is RequestSummary {
  return isRecord(value) && typeof value.title === 'string' && typeof value.detail === 'string';
}

export function readExpertsState(state: unknown): RequestExpertsState | null {
  if (!isRecord(state) || !isSummary(state.summary)) return null;
  const selectedIds = readNumbers(state.selectedIds);
  const excludeIds = readNumbers(state.excludeIds);
  const kind = state.kind === 'shoot' || state.kind === 'edit' ? state.kind : undefined;
  // form은 이 앱의 요청서 화면이 넘긴 값이라 모양만 간단히 확인
  const form =
    isRecord(state.form) && typeof state.form.date === 'string'
      ? (state.form as unknown as ShootRequestForm)
      : undefined;
  return { summary: state.summary, kind, form, excludeIds, selectedIds };
}

export function readDoneState(state: unknown): RequestDoneState | null {
  if (!isRecord(state) || !isSummary(state.summary) || !Array.isArray(state.experts)) return null;
  const experts = state.experts.filter(
    (expert): expert is SentExpert =>
      isRecord(expert) && typeof expert.id === 'number' && typeof expert.name === 'string',
  );
  return { summary: state.summary, experts, kind: state.kind === 'edit' ? 'edit' : 'shoot' };
}

// TODO: API 나오면 이 함수 안만 client.post(`/requests/${requestId}/send`, { expertIds }) 등으로 교체
// 지금은 임시 응답 (0.5초 뒤 항상 성공)
export async function sendRequest(expertIds: number[]): Promise<void> {
  void expertIds;
  await new Promise((resolve) => setTimeout(resolve, 500));
}
