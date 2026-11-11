// 시연용 임시 사진 (Unsplash 무료 사진, https://unsplash.com/license)
// TODO: API 연동 시 이 파일과 src/assets/images/demo/ 폴더를 지우고, 백엔드에서 받은 이미지 URL 사용
import contest1 from '../assets/images/demo/contest-1.jpg';
import home1 from '../assets/images/demo/home-1.jpg';
import home2 from '../assets/images/demo/home-2.jpg';
import home3 from '../assets/images/demo/home-3.jpg';
import home4 from '../assets/images/demo/home-4.jpg';
import home5 from '../assets/images/demo/home-5.jpg';
import mypage from '../assets/images/demo/mypage.jpg';
import onboarding1 from '../assets/images/demo/on-1.jpg';
import onboarding2 from '../assets/images/demo/on-2.jpg';
// 인물 카드용: home-2 원본을 가로로 긴 카드 비율에 맞춰 얼굴 중심으로 다시 자른 사진
import onboarding3 from '../assets/images/demo/on-3.jpg';
// 기타 카드용: search-4 원본을 카드 비율에 맞춰 사람이 가운데 오게 다시 자른 사진
import onboarding4 from '../assets/images/demo/on-4.jpg';
import request from '../assets/images/demo/request.jpg';
import search1 from '../assets/images/demo/search-1.jpg';
import search2 from '../assets/images/demo/search-2.jpg';
import search3 from '../assets/images/demo/search-3.jpg';
import search4 from '../assets/images/demo/search-4.jpg';
import search5 from '../assets/images/demo/search-5.jpg';
import search6 from '../assets/images/demo/search-6.jpg';
import portfolio1 from '../assets/images/demo/portfolio-1.jpg';
import portfolio2 from '../assets/images/demo/portfolio-2.jpg';
import portfolio3 from '../assets/images/demo/portfolio-3.jpg';
import portfolio4 from '../assets/images/demo/portfolio-4.jpg';
import profile1 from '../assets/images/demo/profile-1.jpg';
import profile2 from '../assets/images/demo/profile-2.jpg';
import profile3 from '../assets/images/demo/profile-3.jpg';
import profile4 from '../assets/images/demo/profile-4.jpg';
import profile5 from '../assets/images/demo/profile-5.jpg';
import profile6 from '../assets/images/demo/profile-6.jpg';
import profile7 from '../assets/images/demo/profile-7.jpg';
import profile8 from '../assets/images/demo/profile-8.jpg';
import profile9 from '../assets/images/demo/profile-9.jpg';

// 작가 이름(' 작가' 뺀 이름) → 프로필 사진. 탐색·의뢰에서 같은 작가는 같은 사진
const PROFILE_IMAGES_BY_NAME: Record<string, string> = {
  서하: profile1,
  지훈: profile2,
  무드필름: profile3,
  아리: profile4,
  윤슬: profile5,
  이젤: profile6,
  김하늘: profile7,
  민서: profile8,
  수민: profile9,
};

// '서하 작가'와 '서하' 모두 같은 사진
export function demoProfileImage(name: string): string | undefined {
  return PROFILE_IMAGES_BY_NAME[name.replace(/ 작가$/, '')];
}

// 탐색 화면의 작가 id(/explore/photographers/:id) → 프로필 사진
export const DEMO_PROFILE_IMAGES: Record<number, string> = {
  1: profile1, // 서하 작가
  2: profile2, // 지훈 작가
  3: profile3, // 무드필름
  4: profile4, // 아리 작가
  5: profile5, // 윤슬 작가
  6: profile6, // 이젤 작가
};

// 탐색 메인 카드 대표 사진: 작가 id → 사진 (촬영 탭 카드 순서대로 search-1 ~ 6)
export const DEMO_EXPLORE_CARD_IMAGES: Record<number, string> = {
  1: search1, // 서하 작가
  5: search2, // 윤슬 작가
  3: search3, // 무드필름
  2: search4, // 지훈 작가
  6: search5, // 이젤 작가
  4: search6, // 아리 작가
};

// 작가 포트폴리오 사진 (모든 작가 공통)
export const DEMO_PORTFOLIO_IMAGES = [portfolio1, portfolio2, portfolio3, portfolio4];

// 홈 화면 이달의 콘테스트 대표 사진 (가을의 미학)
export const DEMO_CONTEST_IMAGE = contest1;

// 홈 화면 배너 사진
export const DEMO_HOME_BANNER_IMAGES = {
  newPhotographer: home1, // NEW PHOTOGRAPHER
  contestWinner: home5, // CONTEST WINNER
};

// 홈 화면 취향 맞춤 전문가 카드 사진
export const DEMO_HOME_PHOTOGRAPHER_IMAGES = {
  seoha: home2, // 서하 작가
  yunseul: home3, // 윤슬 작가
  moodFilm: home4, // 무드필름
};

// 마이페이지 내 프로필 사진 (치로)
export const DEMO_MY_PROFILE_IMAGE = mypage;

// 의뢰 메인 배너 사진
export const DEMO_REQUEST_BANNER_IMAGE = request;

// 의뢰 전문가 선택 카드 포트폴리오 3장 (모든 전문가 공통, 가로로 긴 칸이라 가운데가 잘 보이는 사진)
export const DEMO_REQUEST_PORTFOLIO_IMAGES = [portfolio3, search4, home3];

// 의뢰용 작가 프로필 포트폴리오 6장 (모든 전문가 공통, 앞 3장은 전문가 선택 카드와 같음)
export const DEMO_REQUEST_PROFILE_PORTFOLIO_IMAGES = [
  ...DEMO_REQUEST_PORTFOLIO_IMAGES,
  portfolio1,
  search2,
  home1,
];

// 온보딩 사진 스타일 카드: 스타일 이름 → 어울리는 사진
export const DEMO_ONBOARDING_STYLE_IMAGES: Record<string, string> = {
  인물: onboarding3,
  풍경: home4,
  필름: onboarding1,
  자연광: home3,
  컨셉: onboarding2,
  웨딩: search6,
  졸업: portfolio2,
  기타: onboarding4,
};

// 나의 활동 썸네일
export const DEMO_MY_ACTIVITY_IMAGES = {
  requests: [home3, search2, portfolio3], // 내 의뢰 내역
  liked: [search1, search3, search4], // 찜한 전문가 (탐색 카드 사진)
  votes: [contest1, home4], // 콘테스트 투표 내역
};
