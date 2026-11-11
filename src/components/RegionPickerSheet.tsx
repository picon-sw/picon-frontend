import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { formatFullAddress, searchAddresses, type ShootLocation } from '../api/places';
import { BottomSheet } from './BottomSheet';
import styles from './RegionPickerSheet.module.css';

interface RegionPickerSheetProps {
  value: ShootLocation | null;
  onSelect: (location: ShootLocation) => void;
  onClose: () => void;
}

const SEARCH_DELAY_MS = 300;

// 동 단위 주소 검색 후 하나 선택
export function RegionPickerSheet({ value, onSelect, onClose }: RegionPickerSheetProps) {
  const [picked, setPicked] = useState<ShootLocation | null>(value);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');

  // 입력이 멈추고 잠시 뒤에 검색
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const searching = keyword !== '';
  const addressesQuery = useQuery({
    queryKey: ['addresses', keyword],
    queryFn: () => searchAddresses(keyword),
    enabled: searching,
  });

  const isPicked = (address: ShootLocation) =>
    picked !== null && formatFullAddress(picked) === formatFullAddress(address);

  const renderOption = (address: ShootLocation) => {
    const selected = isPicked(address);
    return (
      <button
        key={formatFullAddress(address)}
        type="button"
        role="radio"
        aria-checked={selected}
        className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
        onClick={() => setPicked(address)}
      >
        <span className={styles.optionName}>{formatFullAddress(address)}</span>
      </button>
    );
  };

  const renderResults = () => {
    if (!searching) {
      if (picked) return renderOption(picked);
      return <p className={styles.status}>동 이름이나 주소로 검색해 주세요 (예: 원흥, 성수)</p>;
    }
    if (addressesQuery.isPending) return <p className={styles.status}>불러오는 중이에요</p>;
    if (addressesQuery.isError) {
      return (
        <p className={styles.status}>
          주소를 불러오지 못했어요
          <button type="button" className={styles.retry} onClick={() => addressesQuery.refetch()}>
            다시 시도
          </button>
        </p>
      );
    }
    if (addressesQuery.data.length === 0) {
      return <p className={styles.status}>검색 결과가 없어요. 다른 동 이름으로 찾아 주세요</p>;
    }
    return addressesQuery.data.map(renderOption);
  };

  return (
    <BottomSheet title="촬영 지역" onClose={onClose}>
      <input
        className={styles.search}
        type="search"
        value={search}
        placeholder="동 이름이나 주소로 검색"
        aria-label="주소 검색"
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className={styles.options} role="radiogroup" aria-label="검색 결과">
        {renderResults()}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.confirm}
          disabled={picked === null}
          onClick={() => picked && onSelect(picked)}
        >
          이 지역으로 선택하기
        </button>
      </div>
    </BottomSheet>
  );
}
