// 촬영 지역 (시·군·구 검색 + 상세 주소)
// TODO: API 나오면 searchRegions 안만 client.get('/regions', { params: { q } })로 교체
//       (지금은 예시 데이터, 전문가 수도 서버에서 받기)

// 검색 결과 한 줄: 시·군·구와 그 지역에서 활동 중인 전문가 수
export interface Region {
  sido: string;
  sigungu: string;
  // 지금 요청을 받을 수 있는 전문가 수
  activeExpertCount: number;
}

// 요청서에 담는 촬영 지역 (상세 주소는 작가에게 전달됨)
export interface ShootLocation {
  sido: string;
  sigungu: string;
  detail: string;
}

// 검색 결과에 보여 줄 지역 (예: 서울 마포구)
export function formatRegion({ sido, sigungu }: Pick<Region, 'sido' | 'sigungu'>): string {
  return `${sido} ${sigungu}`;
}

// 요청서 · 요약에 보여 줄 촬영 지역 (예: 마포구 경의선책거리)
export function formatLocation({ sigungu, detail }: ShootLocation): string {
  return `${sigungu} ${detail}`;
}

interface SidoGroup {
  sido: string;
  // 검색할 때 같이 찾는 이름 (예: 서울시, 서울특별시)
  aliases: string[];
  regions: [sigungu: string, activeExpertCount: number][];
}

const SIDO_GROUPS: SidoGroup[] = [
  {
    sido: '서울',
    aliases: ['서울시', '서울특별시'],
    regions: [
      ['강남구', 18],
      ['강동구', 6],
      ['강북구', 3],
      ['강서구', 7],
      ['관악구', 5],
      ['광진구', 9],
      ['구로구', 4],
      ['금천구', 0],
      ['노원구', 5],
      ['도봉구', 2],
      ['동대문구', 4],
      ['동작구', 6],
      ['마포구', 12],
      ['서대문구', 8],
      ['서초구', 11],
      ['성동구', 14],
      ['성북구', 5],
      ['송파구', 10],
      ['양천구', 3],
      ['영등포구', 7],
      ['용산구', 13],
      ['은평구', 4],
      ['종로구', 9],
      ['중구', 6],
      ['중랑구', 1],
    ],
  },
  {
    sido: '경기',
    aliases: ['경기도'],
    regions: [
      ['고양시 덕양구', 4],
      ['고양시 일산동구', 5],
      ['고양시 일산서구', 3],
      ['성남시 분당구', 8],
      ['수원시 영통구', 6],
      ['용인시 수지구', 4],
      ['파주시', 2],
    ],
  },
  {
    sido: '인천',
    aliases: ['인천시', '인천광역시'],
    regions: [
      ['연수구', 5],
      ['중구', 2],
    ],
  },
  {
    sido: '부산',
    aliases: ['부산시', '부산광역시'],
    regions: [
      ['해운대구', 7],
      ['수영구', 4],
      ['부산진구', 3],
    ],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const compact = (text: string) => text.replace(/\s/g, '');

// 시·도로 검색하면 그 안의 시·군·구 전부, 시·군·구 이름 일부로도 찾음 (띄어쓰기 무시)
// 시·군·구 이름으로 시작하는 결과를 먼저, 그 안에서는 원래 순서(가나다) 유지
export async function searchRegions(q: string): Promise<Region[]> {
  await delay(300);
  const keyword = compact(q);
  if (!keyword) return [];

  const results: { region: Region; rank: number; index: number }[] = [];
  SIDO_GROUPS.forEach(({ sido, aliases, regions }) => {
    const sidoMatched = [sido, ...aliases].some((name) => compact(name).includes(keyword));
    regions.forEach(([sigungu, activeExpertCount]) => {
      const name = compact(sigungu);
      const full = compact(`${sido}${sigungu}`);
      let rank: number | null = null;
      if (name.startsWith(keyword)) rank = 0;
      else if (name.includes(keyword)) rank = 1;
      else if (sidoMatched || full.includes(keyword)) rank = 2;
      if (rank !== null) {
        results.push({ region: { sido, sigungu, activeExpertCount }, rank, index: results.length });
      }
    });
  });

  return results.sort((a, b) => a.rank - b.rank || a.index - b.index).map(({ region }) => region);
}
