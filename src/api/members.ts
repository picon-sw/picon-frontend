import { client, type ApiResponse } from './client';

// 필요한 도움. 촬영과 편집을 모두 고르면 SHOOTING_EDITING
export type ServiceType = 'SHOOTING' | 'SHOOTING_EDITING' | 'EDITING';

export type Mood =
  'BRIGHT' | 'NATURAL' | 'CALM' | 'SOPHISTICATED' | 'DREAMY' | 'DISTINCTIVE' | 'DRAMATIC';

// 사진 분위기 코드와 화면 표시 (API 명세 '분위기 코드' 표와 같은 순서)
export const MOODS: { code: Mood; label: string }[] = [
  { code: 'BRIGHT', label: '밝음' },
  { code: 'NATURAL', label: '자연스러움' },
  { code: 'CALM', label: '차분함' },
  { code: 'SOPHISTICATED', label: '세련됨' },
  { code: 'DREAMY', label: '몽환적' },
  { code: 'DISTINCTIVE', label: '개성적' },
  { code: 'DRAMATIC', label: '극적 표현' },
];

// 서버 검증 규칙과 같게 맞춤
export const MAX_MOODS = 3;
export const NICKNAME_MAX_LENGTH = 20;

export type Gender = 'MALE' | 'FEMALE';

export interface OnboardingRequest {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  // 동의하지 않아도 false로 꼭 보냄
  marketingAgreed: boolean;
  serviceType: ServiceType;
  // 1~3개, 중복 없이
  moods: Mood[];
  nickname: string;
  // 선택 항목은 입력하지 않으면 null
  birth: string | null; // yyyy-MM-dd, 오늘 이전
  gender: Gender | null;
  phoneNumber: string | null; // 하이픈 없이 숫자 10~11자리
}

// 약관 동의부터 프로필까지 한 번에 저장. 이미 온보딩한 회원이면 409
// 프로필 사진은 이번 범위에서 제외 (이후 프로필 수정에서 등록)
export async function completeOnboarding(body: OnboardingRequest) {
  await client.put<ApiResponse<undefined>>('/members/me/onboarding', body);
}
