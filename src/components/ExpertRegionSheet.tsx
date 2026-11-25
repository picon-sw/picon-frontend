import { useState } from 'react';
import type { Expert } from '../api/experts';
import type { ShootLocation } from '../api/places';
import { BottomSheet } from './BottomSheet';
import regionStyles from './RegionPickerSheet.module.css';
import styles from './ExpertRegionSheet.module.css';

const DETAIL_MAX_LENGTH = 30;

interface ExpertRegionSheetProps {
  expert: Expert;
  value: ShootLocation | null;
  onSelect: (location: ShootLocation) => void;
  onClose: () => void;
}

// 바로 의뢰하기의 촬영 지역: 작가 활동 지역은 고정, 상세 주소만 입력
export function ExpertRegionSheet({ expert, value, onSelect, onClose }: ExpertRegionSheetProps) {
  const { sido, sigungu } = expert.region;
  const [detail, setDetail] = useState(
    value && value.sido === sido && value.sigungu === sigungu ? value.detail : '',
  );
  const trimmedDetail = detail.trim();

  return (
    <BottomSheet title="촬영 지역" onClose={onClose}>
      <div className={styles.regionTop}>
        <span>{expert.name} 활동 지역</span>
        <span>이 지역에서만 촬영해요</span>
      </div>
      <p className={styles.region}>
        {sido} {sigungu}
      </p>

      <div className={regionStyles.detail}>
        <label className={regionStyles.detailLabel} htmlFor="expert-region-detail">
          상세 주소
        </label>
        <input
          id="expert-region-detail"
          className={regionStyles.detailInput}
          type="text"
          value={detail}
          maxLength={DETAIL_MAX_LENGTH}
          placeholder="상세 주소를 입력해 주세요 (예: 경의선책거리)"
          aria-describedby="expert-region-detail-help"
          onChange={(event) => setDetail(event.target.value)}
        />
        <p id="expert-region-detail-help" className={regionStyles.detailHelp}>
          입력한 장소는 {expert.name}에게 전달돼요
        </p>
      </div>

      <div className={regionStyles.footer}>
        <button
          type="button"
          className={regionStyles.confirm}
          disabled={trimmedDetail === ''}
          onClick={() => trimmedDetail && onSelect({ sido, sigungu, detail: trimmedDetail })}
        >
          이 지역으로 선택하기
        </button>
      </div>
    </BottomSheet>
  );
}
