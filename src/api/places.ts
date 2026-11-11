// 촬영 지역 (동 단위 주소 검색)
// TODO: API 나오면 searchAddresses 안만 client.get('/addresses', { params: { q } })로 교체
//       (주소 검색 API는 백엔드에서 호출, 지금은 예시 데이터)

// 요청서에 담는 촬영 지역
export interface ShootLocation {
  sido: string;
  sigungu: string;
  dong: string;
}

// 요청서 · 요약에 보여 줄 주소 (예: 고양시 덕양구 원흥동)
export function formatLocation({ sigungu, dong }: ShootLocation): string {
  return `${sigungu} ${dong}`;
}

// 검색 결과에 보여 줄 전체 주소 (예: 경기 고양시 덕양구 원흥동)
export function formatFullAddress({ sido, sigungu, dong }: ShootLocation): string {
  return `${sido} ${sigungu} ${dong}`;
}

interface DongGroup {
  sido: string;
  sigungu: string;
  dongs: string[];
}

const DONG_GROUPS: DongGroup[] = [
  {
    sido: '서울',
    sigungu: '성동구',
    dongs: [
      '상왕십리동',
      '하왕십리동',
      '홍익동',
      '도선동',
      '마장동',
      '사근동',
      '행당동',
      '응봉동',
      '금호동1가',
      '금호동2가',
      '금호동3가',
      '금호동4가',
      '옥수동',
      '성수동1가',
      '성수동2가',
      '송정동',
      '용답동',
    ],
  },
  {
    sido: '서울',
    sigungu: '마포구',
    dongs: [
      '아현동',
      '공덕동',
      '신공덕동',
      '도화동',
      '용강동',
      '대흥동',
      '염리동',
      '신수동',
      '서교동',
      '동교동',
      '합정동',
      '망원동',
      '연남동',
      '성산동',
      '상암동',
      '중동',
      '창전동',
      '상수동',
      '노고산동',
    ],
  },
  {
    sido: '서울',
    sigungu: '강남구',
    dongs: [
      '역삼동',
      '개포동',
      '청담동',
      '삼성동',
      '대치동',
      '신사동',
      '논현동',
      '압구정동',
      '세곡동',
      '자곡동',
      '율현동',
      '일원동',
      '수서동',
      '도곡동',
    ],
  },
  {
    sido: '서울',
    sigungu: '송파구',
    dongs: [
      '잠실동',
      '신천동',
      '풍납동',
      '송파동',
      '석촌동',
      '삼전동',
      '가락동',
      '문정동',
      '장지동',
      '방이동',
      '오금동',
      '거여동',
      '마천동',
    ],
  },
  {
    sido: '경기',
    sigungu: '고양시 덕양구',
    dongs: [
      '주교동',
      '원당동',
      '신원동',
      '원흥동',
      '도내동',
      '성사동',
      '북한동',
      '효자동',
      '지축동',
      '오금동',
      '삼송동',
      '동산동',
      '용두동',
      '벽제동',
      '선유동',
      '고양동',
      '대자동',
      '관산동',
      '내유동',
      '토당동',
      '내곡동',
      '대장동',
      '화정동',
      '강매동',
      '행주내동',
      '행주외동',
      '신평동',
      '행신동',
      '화전동',
      '현천동',
      '덕은동',
      '향동동',
    ],
  },
  {
    sido: '경기',
    sigungu: '고양시 일산동구',
    dongs: [
      '식사동',
      '중산동',
      '정발산동',
      '장항동',
      '마두동',
      '백석동',
      '풍동',
      '산황동',
      '사리현동',
      '지영동',
      '설문동',
      '문봉동',
      '성석동',
    ],
  },
  {
    sido: '경기',
    sigungu: '고양시 일산서구',
    dongs: ['일산동', '주엽동', '탄현동', '대화동', '덕이동', '가좌동', '구산동', '법곳동'],
  },
  {
    sido: '경기',
    sigungu: '파주시',
    dongs: [
      '금촌동',
      '아동동',
      '야동동',
      '검산동',
      '맥금동',
      '교하동',
      '야당동',
      '다율동',
      '오도동',
      '상지석동',
      '산남동',
      '동패동',
      '당하동',
      '문발동',
      '송촌동',
      '목동동',
      '하지석동',
      '서패동',
      '신촌동',
      '연다산동',
      '와동동',
      '금릉동',
    ],
  },
  {
    sido: '인천',
    sigungu: '연수구',
    dongs: ['옥련동', '선학동', '연수동', '청학동', '동춘동', '송도동'],
  },
  {
    sido: '부산',
    sigungu: '해운대구',
    dongs: ['우동', '중동', '좌동', '송정동', '반여동', '반송동', '재송동', '석대동'],
  },
  {
    sido: '부산',
    sigungu: '수영구',
    dongs: ['남천동', '수영동', '망미동', '광안동', '민락동'],
  },
];

const ADDRESSES: ShootLocation[] = DONG_GROUPS.flatMap(({ sido, sigungu, dongs }) =>
  dongs.map((dong) => ({ sido, sigungu, dong })),
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const compact = (text: string) => text.replace(/\s/g, '');

// 동 이름 · 시/군/구 · 시/도 어디에 걸려도 찾음 (띄어쓰기 무시)
// 동 이름에 걸린 주소를 먼저, 그 안에서는 검색어로 시작하는 동을 먼저 보여 줌
export async function searchAddresses(q: string): Promise<ShootLocation[]> {
  await delay(300);
  const keyword = compact(q);
  if (!keyword) return [];

  const rank = (address: ShootLocation) => {
    if (address.dong.startsWith(keyword)) return 0;
    if (address.dong.includes(keyword)) return 1;
    return 2;
  };

  return ADDRESSES.filter((address) => compact(formatFullAddress(address)).includes(keyword))
    .map((address, index) => ({ address, index, rank: rank(address) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ address }) => address);
}
