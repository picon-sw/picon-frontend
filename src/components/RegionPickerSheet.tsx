import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { formatRegion, searchRegions, type Region, type ShootLocation } from '../api/places';
import { BottomSheet } from './BottomSheet';
import styles from './RegionPickerSheet.module.css';

interface RegionPickerSheetProps {
  value: ShootLocation | null;
  onSelect: (location: ShootLocation) => void;
  onClose: () => void;
}

// 고른 지역 (전문가 수는 검색 결과에서 고른 경우에만 앎)
type PickedRegion = Pick<Region, 'sido' | 'sigungu'> & { activeExpertCount?: number };

const SEARCH_DELAY_MS = 300;
const DETAIL_MAX_LENGTH = 30;

// 시·군·구 검색 후 하나 고르고, 바로 아래에서 상세 주소 입력
export function RegionPickerSheet({ value, onSelect, onClose }: RegionPickerSheetProps) {
  const [picked, setPicked] = useState<PickedRegion | null>(value);
  const [detail, setDetail] = useState(value?.detail ?? '');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const detailInputRef = useRef<HTMLInputElement>(null);
  // 사용자가 방금 지역을 골랐을 때만 상세 주소 입력칸으로 커서 이동
  const [focusDetail, setFocusDetail] = useState(false);

  // 입력이 멈추고 잠시 뒤에 검색
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (focusDetail && picked) detailInputRef.current?.focus();
  }, [focusDetail, picked]);

  const searching = keyword !== '';
  const regionsQuery = useQuery({
    queryKey: ['regions', keyword],
    queryFn: () => searchRegions(keyword),
    enabled: searching,
  });

  const pick = (region: Region) => {
    setPicked(region);
    setFocusDetail(true);
  };

  // 다시 검색하면 고른 지역은 풀고 결과 목록을 보여 줌 (적어 둔 상세 주소는 유지)
  const changeSearch = (text: string) => {
    setSearch(text);
    setPicked(null);
    setFocusDetail(false);
  };

  const renderCount = (count: number | undefined) => {
    if (count === undefined) return null;
    return (
      <span className={count === 0 ? `${styles.count} ${styles.countZero}` : styles.count}>
        {count}명
      </span>
    );
  };

  const renderHeader = (left: string) => (
    <div className={styles.listHeader}>
      <span>{left}</span>
      <span>활동 중인 전문가</span>
    </div>
  );

  const renderPicked = (region: PickedRegion) => (
    <>
      {region.activeExpertCount !== undefined && renderHeader('선택한 지역')}
      <div className={styles.options}>
        <button
          type="button"
          role="radio"
          aria-checked="true"
          className={`${styles.option} ${styles.optionSelected}`}
          onClick={() => {
            setPicked(null);
            setFocusDetail(false);
          }}
        >
          <span className={styles.optionName}>{formatRegion(region)}</span>
          {renderCount(region.activeExpertCount)}
        </button>
      </div>
    </>
  );

  const renderResults = () => {
    if (!searching) {
      return <p className={styles.status}>시·군·구 이름으로 검색해 주세요 (예: 마포, 서울)</p>;
    }
    if (regionsQuery.isPending) return <p className={styles.status}>불러오는 중이에요</p>;
    if (regionsQuery.isError) {
      return (
        <p className={styles.status}>
          지역을 불러오지 못했어요
          <button type="button" className={styles.retry} onClick={() => regionsQuery.refetch()}>
            다시 시도
          </button>
        </p>
      );
    }
    if (regionsQuery.data.length === 0) {
      return <p className={styles.status}>검색 결과가 없어요. 다른 지역 이름으로 찾아 주세요</p>;
    }
    return (
      <>
        {renderHeader(`검색 결과 ${regionsQuery.data.length}곳`)}
        <div className={styles.options}>
          {regionsQuery.data.map((region) => (
            <button
              key={formatRegion(region)}
              type="button"
              role="radio"
              aria-checked="false"
              className={styles.option}
              onClick={() => pick(region)}
            >
              <span className={styles.optionName}>{formatRegion(region)}</span>
              {renderCount(region.activeExpertCount)}
            </button>
          ))}
        </div>
      </>
    );
  };

  const trimmedDetail = detail.trim();
  const canConfirm = picked !== null && trimmedDetail !== '';

  return (
    <BottomSheet title="촬영 지역" onClose={onClose}>
      <input
        className={styles.search}
        type="search"
        value={search}
        placeholder="시·군·구 이름으로 검색"
        aria-label="지역 검색"
        onChange={(event) => changeSearch(event.target.value)}
      />

      <div className={styles.results} role="radiogroup" aria-label="검색 결과">
        {picked ? renderPicked(picked) : renderResults()}
      </div>

      {picked && (
        <div className={styles.detail}>
          <label className={styles.detailLabel} htmlFor="region-detail">
            상세 주소
          </label>
          <input
            ref={detailInputRef}
            id="region-detail"
            className={styles.detailInput}
            type="text"
            value={detail}
            maxLength={DETAIL_MAX_LENGTH}
            placeholder="상세 주소를 입력해 주세요 (예: 경의선책거리)"
            aria-describedby="region-detail-help"
            onChange={(event) => setDetail(event.target.value)}
          />
          <p id="region-detail-help" className={styles.detailHelp}>
            입력한 장소는 요청을 보낸 작가에게 전달돼요
          </p>
        </div>
      )}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.confirm}
          disabled={!canConfirm}
          onClick={() =>
            picked &&
            canConfirm &&
            onSelect({ sido: picked.sido, sigungu: picked.sigungu, detail: trimmedDetail })
          }
        >
          이 지역으로 선택하기
        </button>
      </div>
    </BottomSheet>
  );
}
