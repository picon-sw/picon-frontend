// 촬영 지역 · 추천 장소
// TODO: API 나오면 아래 두 함수 안만 client.get('/places', ...)로 교체 (지금은 예시 데이터, 형식은 가안)

export interface Region {
  sido: string;
  sigungu: string[];
}

export interface Place {
  id: string;
  name: string;
  address: string;
  sido: string;
  sigungu: string;
}

// 요청서에 담는 촬영 지역
// 추천 장소: placeId + place, 직접 입력: placeId null + place, 장소 미정: 둘 다 null
export interface ShootLocation {
  sido: string;
  sigungu: string;
  placeId: string | null;
  place: string | null;
}

export function formatLocation({ sido, sigungu, place }: ShootLocation): string {
  return place ?? `${sido} ${sigungu}`;
}

export interface PlaceQuery {
  sido?: string;
  sigungu?: string;
  q?: string;
}

const REGIONS: Region[] = [
  {
    sido: '서울',
    sigungu: ['강남구', '마포구', '성동구', '송파구', '영등포구', '용산구', '종로구'],
  },
  { sido: '경기', sigungu: ['고양시', '수원시', '성남시', '파주시', '용인시'] },
  { sido: '인천', sigungu: ['연수구', '중구', '강화군'] },
  { sido: '부산', sigungu: ['해운대구', '수영구', '영도구'] },
  { sido: '제주', sigungu: ['제주시', '서귀포시'] },
];

const PLACES: Place[] = [
  { id: 'p1', name: '서울숲', address: '서울 성동구 뚝섬로 273', sido: '서울', sigungu: '성동구' },
  {
    id: 'p2',
    name: '성수동 카페거리',
    address: '서울 성동구 성수동2가',
    sido: '서울',
    sigungu: '성동구',
  },
  { id: 'p3', name: '경복궁', address: '서울 종로구 사직로 161', sido: '서울', sigungu: '종로구' },
  {
    id: 'p4',
    name: '북촌한옥마을',
    address: '서울 종로구 계동길 37',
    sido: '서울',
    sigungu: '종로구',
  },
  {
    id: 'p5',
    name: '경의선숲길 연남동',
    address: '서울 마포구 연남동',
    sido: '서울',
    sigungu: '마포구',
  },
  {
    id: 'p6',
    name: '여의도 한강공원',
    address: '서울 영등포구 여의동로 330',
    sido: '서울',
    sigungu: '영등포구',
  },
  {
    id: 'p7',
    name: '올림픽공원',
    address: '서울 송파구 올림픽로 424',
    sido: '서울',
    sigungu: '송파구',
  },
  { id: 'p8', name: '석촌호수', address: '서울 송파구 잠실동', sido: '서울', sigungu: '송파구' },
  { id: 'p9', name: '해방촌', address: '서울 용산구 용산동2가', sido: '서울', sigungu: '용산구' },
  {
    id: 'p10',
    name: '수원 화성',
    address: '경기 수원시 팔달구 정조로 825',
    sido: '경기',
    sigungu: '수원시',
  },
  {
    id: 'p11',
    name: '일산 호수공원',
    address: '경기 고양시 일산동구 호수로 595',
    sido: '경기',
    sigungu: '고양시',
  },
  {
    id: 'p12',
    name: '헤이리 예술마을',
    address: '경기 파주시 탄현면 헤이리마을길',
    sido: '경기',
    sigungu: '파주시',
  },
  {
    id: 'p13',
    name: '송도 센트럴파크',
    address: '인천 연수구 컨벤시아대로 160',
    sido: '인천',
    sigungu: '연수구',
  },
  {
    id: 'p14',
    name: '해운대 해수욕장',
    address: '부산 해운대구 우동',
    sido: '부산',
    sigungu: '해운대구',
  },
  {
    id: 'p15',
    name: '광안리 해수욕장',
    address: '부산 수영구 광안해변로',
    sido: '부산',
    sigungu: '수영구',
  },
  {
    id: 'p16',
    name: '협재 해수욕장',
    address: '제주 제주시 한림읍 협재리',
    sido: '제주',
    sigungu: '제주시',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 시/도 · 시/군/구 목록
export async function fetchRegions(): Promise<Region[]> {
  await delay(300);
  return REGIONS;
}

// 검색어가 있으면 전체에서 이름·주소로 찾고, 없으면 고른 지역의 추천 장소
export async function fetchPlaces({ sido, sigungu, q }: PlaceQuery): Promise<Place[]> {
  await delay(300);
  const keyword = q?.trim();
  if (keyword) {
    return PLACES.filter(
      (place) => place.name.includes(keyword) || place.address.includes(keyword),
    );
  }
  return PLACES.filter((place) => place.sido === sido && place.sigungu === sigungu);
}
