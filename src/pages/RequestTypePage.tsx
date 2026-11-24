import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import cameraIcon from '../assets/icons/request/camera.svg';
import imageIcon from '../assets/icons/request/image.svg';
import radioOffIcon from '../assets/icons/request/radio-off.svg';
import radioOnIcon from '../assets/icons/request/radio-on.svg';
import styles from './RequestTypePage.module.css';

// shoot: 촬영, edit: 편집
type RequestType = 'shoot' | 'edit';

interface RequestTypeOption {
  value: RequestType;
  title: string;
  description: string;
}

const REQUEST_TYPES: RequestTypeOption[] = [
  { value: 'shoot', title: '촬영', description: '작가가 찍고, 기본 보정된\n사진을 받아요' },
  { value: 'edit', title: '편집', description: '이미 찍은 사진을\n보정 전문가에게 맡겨요' },
];

interface TypeIconProps {
  type: RequestType;
}

// 촬영: 카메라, 편집: 사진
function TypeIcon({ type }: TypeIconProps) {
  return (
    <span className={styles.icon}>
      <img src={type === 'edit' ? imageIcon : cameraIcon} alt="" />
    </span>
  );
}

export function RequestTypePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);

  // 주소로 바로 들어온 경우(이전 화면 없음)는 의뢰 메인으로
  const goBack = () => {
    if (location.key === 'default') navigate('/requests');
    else navigate(-1);
  };

  // 촬영은 촬영 요청서, 편집은 편집 요청서
  const goNext = () => {
    if (selectedType === null) return;
    navigate(selectedType === 'edit' ? '/requests/new/edit' : '/requests/new/shoot');
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>요청서 작성</h1>
      </header>

      <section className={styles.content}>
        <h2 className={styles.question}>어떤 작업이 필요하세요?</h2>
        <p className={styles.guide}>선택에 따라 요청서 항목이 달라져요</p>

        <div className={styles.options} role="radiogroup" aria-label="작업 유형">
          {REQUEST_TYPES.map(({ value, title, description }) => {
            const selected = selectedType === value;
            return (
              <label
                key={value}
                className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
              >
                <input
                  className={styles.radio}
                  type="radio"
                  name="requestType"
                  value={value}
                  checked={selected}
                  onChange={() => setSelectedType(value)}
                />
                <TypeIcon type={value} />
                <span className={styles.text}>
                  <span className={styles.optionTitle}>{title}</span>
                  <span className={styles.optionDescription}>{description}</span>
                </span>
                <img
                  className={styles.radioMark}
                  src={selected ? radioOnIcon : radioOffIcon}
                  alt=""
                />
              </label>
            );
          })}
        </div>
      </section>

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.nextButton}
          disabled={selectedType === null}
          onClick={goNext}
        >
          다음
        </button>
      </div>
    </main>
  );
}
