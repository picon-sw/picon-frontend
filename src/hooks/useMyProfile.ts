import { useState } from 'react';
import { DEMO_MY_PROFILE_IMAGE } from '../constants/demoImages';

export type Gender = '여성' | '남성' | '선택 안함';

export interface MyProfileInfo {
  nickname: string;
  introduction: string;
  // YYYY-MM-DD (input type="date" 값)
  birthDate: string;
  gender: Gender | '';
  phone: string;
  // 백엔드에서 받은 이미지 URL (지금은 시연용 사진 또는 새로 고른 사진의 미리 보기 주소)
  profileImageUrl?: string;
}

// TODO: API 연동 시 서버의 내 프로필로 교체. 지금은 화면 이동 간에만 유지되고 새로고침하면 초기화
let myProfileCache: MyProfileInfo = {
  nickname: '치로',
  introduction: '일상 속 작은 순간들을 기록하고 싶어요.',
  birthDate: '2003-07-28',
  gender: '여성',
  phone: '010-1234-5678',
  // TODO: 시연용 사진 (API 연동 시 삭제)
  profileImageUrl: DEMO_MY_PROFILE_IMAGE,
};

// 마이페이지 · 프로필 수정 화면이 함께 쓰는 내 프로필
export function useMyProfile() {
  const [profile, setProfile] = useState(myProfileCache);

  // TODO: API 연동 시 서버에 저장 요청(사진은 Pre-signed URL 업로드 후 key) 후 반영
  const saveProfile = (next: MyProfileInfo) => {
    // 이전에 고른 사진의 미리 보기 주소는 더 이상 안 쓰면 정리
    const previous = myProfileCache.profileImageUrl;
    if (previous?.startsWith('blob:') && previous !== next.profileImageUrl) {
      URL.revokeObjectURL(previous);
    }
    myProfileCache = next;
    setProfile(next);
  };

  return { profile, saveProfile };
}
