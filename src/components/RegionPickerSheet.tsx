import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchPlaces, fetchRegions, type Place, type ShootLocation } from '../api/places';
import { BottomSheet } from './BottomSheet';
import styles from './RegionPickerSheet.module.css';

interface RegionPickerSheetProps {
  value: ShootLocation | null;
  onSelect: (location: ShootLocation) => void;
  onClose: () => void;
}

// place: 추천 장소, custom: 직접 입력, none: 장소 미정(지역만 선택)
type PlaceMode = 'place' | 'custom' | 'none';

const CUSTOM_MAX_LENGTH = 30;
const SEARCH_DELAY_MS = 300;

// 검색, 시/도 · 시/군/구, 추천 장소 단일 선택
export function RegionPickerSheet({ value, onSelect, onClose }: RegionPickerSheetProps) {
  const [sido, setSido] = useState<string | null>(value?.sido ?? null);
  const [sigungu, setSigungu] = useState<string | null>(value?.sigungu ?? null);
  const [mode, setMode] = useState<PlaceMode | null>(() => {
    if (!value) return null;
    if (value.placeId) return 'place';
    return value.place ? 'custom' : 'none';
  });
  const [picked, setPicked] = useState<Place | null>(() =>
    value?.placeId && value.place
      ? {
          id: value.placeId,
          name: value.place,
          address: '',
          sido: value.sido,
          sigungu: value.sigungu,
        }
      : null,
  );
  const [customText, setCustomText] = useState(value && !value.placeId ? (value.place ?? '') : '');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');

  // 입력이 멈추고 잠시 뒤에 검색
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const regionsQuery = useQuery({ queryKey: ['regions'], queryFn: fetchRegions });
  const searching = keyword !== '';
  const placesQuery = useQuery({
    queryKey: ['places', searching ? { q: keyword } : { sido, sigungu }],
    queryFn: () =>
      fetchPlaces(searching ? { q: keyword } : { sido: sido ?? '', sigungu: sigungu ?? '' }),
    enabled: searching || (sido !== null && sigungu !== null),
  });

  const sigunguOptions = regionsQuery.data?.find((region) => region.sido === sido)?.sigungu ?? [];

  const chooseSido = (next: string) => {
    if (next === sido) return;
    setSido(next);
    setSigungu(null);
    setMode(null);
    setPicked(null);
  };

  const chooseSigungu = (next: string) => {
    if (next === sigungu) return;
    setSigungu(next);
    setMode(null);
    setPicked(null);
  };

  const choosePlace = (place: Place) => {
    setSido(place.sido);
    setSigungu(place.sigungu);
    setMode('place');
    setPicked(place);
    setSearch('');
    setKeyword('');
  };

  const canConfirm =
    sido !== null &&
    sigungu !== null &&
    (mode === 'none' ||
      (mode === 'place' && picked !== null) ||
      (mode === 'custom' && customText.trim() !== ''));

  const confirm = () => {
    if (!canConfirm || !sido || !sigungu) return;
    if (mode === 'place' && picked) {
      onSelect({ sido, sigungu, placeId: picked.id, place: picked.name });
    } else {
      onSelect({
        sido,
        sigungu,
        placeId: null,
        place: mode === 'custom' ? customText.trim() : null,
      });
    }
  };

  const renderPlaces = (emptyText: string) => {
    if (placesQuery.isPending) return <p className={styles.status}>불러오는 중이에요</p>;
    if (placesQuery.isError) {
      return (
        <p className={styles.status}>
          장소를 불러오지 못했어요
          <button type="button" className={styles.retry} onClick={() => placesQuery.refetch()}>
            다시 시도
          </button>
        </p>
      );
    }
    if (placesQuery.data.length === 0) return <p className={styles.status}>{emptyText}</p>;
    return placesQuery.data.map((place) => {
      const selected = mode === 'place' && picked?.id === place.id;
      return (
        <button
          key={place.id}
          type="button"
          role="radio"
          aria-checked={selected}
          className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
          onClick={() => choosePlace(place)}
        >
          <span className={styles.optionName}>{place.name}</span>
          <span className={styles.optionAddress}>{place.address}</span>
        </button>
      );
    });
  };

  return (
    <BottomSheet title="촬영 지역" onClose={onClose}>
      <input
        className={styles.search}
        type="search"
        value={search}
        placeholder="장소 이름이나 주소로 검색"
        aria-label="장소 검색"
        onChange={(event) => setSearch(event.target.value)}
      />

      {searching ? (
        <div className={styles.options} role="radiogroup" aria-label="검색 결과">
          {renderPlaces('검색 결과가 없어요. 지역을 고른 뒤 직접 입력해 주세요')}
        </div>
      ) : (
        <>
          <h3 className={styles.sectionTitle}>시/도</h3>
          {regionsQuery.isPending && <p className={styles.status}>불러오는 중이에요</p>}
          {regionsQuery.isError && (
            <p className={styles.status}>
              지역을 불러오지 못했어요
              <button type="button" className={styles.retry} onClick={() => regionsQuery.refetch()}>
                다시 시도
              </button>
            </p>
          )}
          {regionsQuery.data && (
            <div className={styles.chips} role="radiogroup" aria-label="시/도">
              {regionsQuery.data.map((region) => (
                <button
                  key={region.sido}
                  type="button"
                  role="radio"
                  aria-checked={sido === region.sido}
                  className={
                    sido === region.sido ? `${styles.chip} ${styles.chipSelected}` : styles.chip
                  }
                  onClick={() => chooseSido(region.sido)}
                >
                  {region.sido}
                </button>
              ))}
            </div>
          )}

          {sido && (
            <>
              <h3 className={styles.sectionTitle}>시/군/구</h3>
              <div className={styles.chips} role="radiogroup" aria-label="시/군/구">
                {sigunguOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={sigungu === name}
                    className={
                      sigungu === name ? `${styles.chip} ${styles.chipSelected}` : styles.chip
                    }
                    onClick={() => chooseSigungu(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}

          {sido && sigungu && (
            <>
              <h3 className={styles.sectionTitle}>추천 장소</h3>
              <div className={styles.options} role="radiogroup" aria-label="추천 장소">
                {renderPlaces('추천 장소가 아직 없어요')}
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'custom'}
                  className={
                    mode === 'custom' ? `${styles.option} ${styles.optionSelected}` : styles.option
                  }
                  onClick={() => setMode('custom')}
                >
                  <span className={styles.optionName}>직접 입력</span>
                </button>
                {mode === 'custom' && (
                  <input
                    className={styles.customInput}
                    type="text"
                    value={customText}
                    maxLength={CUSTOM_MAX_LENGTH}
                    placeholder="원하는 장소를 적어 주세요"
                    aria-label="장소 직접 입력"
                    autoFocus
                    onChange={(event) => setCustomText(event.target.value)}
                  />
                )}
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'none'}
                  className={
                    mode === 'none' ? `${styles.option} ${styles.optionSelected}` : styles.option
                  }
                  onClick={() => setMode('none')}
                >
                  <span className={styles.optionName}>장소 미정</span>
                  <span className={styles.optionAddress}>
                    {sido} {sigungu}만 선택해요
                  </span>
                </button>
              </div>
            </>
          )}
        </>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.confirm} disabled={!canConfirm} onClick={confirm}>
          이 지역으로 선택하기
        </button>
      </div>
    </BottomSheet>
  );
}
