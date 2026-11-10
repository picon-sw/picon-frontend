import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import styles from './OnboardingPage.module.css';

import loginBg from '../assets/icons/onboarding/login_bg.svg';
import kakaoIcon from '../assets/icons/onboarding/kakao.svg';
import cameraIcon from '../assets/icons/onboarding/camera.svg';
import cameraActiveIcon from '../assets/icons/onboarding/camera.active.svg';
import editIcon from '../assets/icons/onboarding/edit.svg';
import editActiveIcon from '../assets/icons/onboarding/edit.active.svg';
import humanIcon from '../assets/icons/onboarding/human.svg';

const photoStyles = ['인물', '풍경', '필름', '자연광', '컨셉', '웨딩', '졸업', '기타'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement>(null);

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [help, setHelp] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');

  // 오늘 날짜 (미래 생년월일 선택 방지)
  const today = new Date();
  const maxBirthDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  function toggleItem(item: string, selected: string[], update: (items: string[]) => void) {
    if (selected.includes(item)) {
      update(selected.filter((value) => value !== item));
    } else {
      update([...selected, item]);
    }
  }

  function goBack() {
    if (step === 1) {
      setStarted(false);
    } else {
      setStep(step - 1);
    }
  }

  function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function nextStep() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // TODO: 백엔드 API 연결 후 온보딩 정보 저장
    navigate('/');
  }

  const phoneValid = phone.trim() === '' || /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone);

  const canNext =
    step === 1
      ? help.length > 0
      : step === 2
        ? selectedStyles.length > 0
        : nickname.trim().length > 0 && phoneValid;

  if (!started) {
    return (
      <main className={styles.page}>
        <div className={styles.loginPhoto}>
          <img src={loginBg} alt="" className={styles.loginBackground} />

          <div className={styles.loginLogo}>
            PIC:<span>ON</span>
          </div>

          <div className={styles.loginText}>
            <p>나만의 순간을 더 특별하게</p>
            <h1>
              취향에 꼭 맞는
              <br />
              사진 전문가를 만나보세요
            </h1>
            <p>촬영부터 보정까지, 작품을 보고 바로 연결해 드려요.</p>
          </div>
        </div>

        <div className={styles.loginBottom}>
          <button type="button" className={styles.kakaoButton} onClick={() => setStarted(true)}>
            <img src={kakaoIcon} alt="" />
            카카오로 시작하기
          </button>

          <p>계속하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.stepHeader}>
        <div className={styles.stepTop}>
          <button
            type="button"
            className={styles.backButton}
            onClick={goBack}
            aria-label="이전 단계"
          >
            ‹
          </button>
          <span>{step} / 3</span>
        </div>

        <div className={styles.progress}>
          <div style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      <div className={styles.stepContent}>
        {step === 1 && (
          <>
            <p className={styles.stepLabel}>맞춤 추천 설정</p>

            <h1 className={styles.title}>어떤 도움이 필요하세요?</h1>

            <p className={styles.description}>
              복수 선택도 가능해요.
              <br />
              나중에 언제든 변경할 수 있습니다.
            </p>

            <div className={styles.helpList}>
              {[
                {
                  name: '촬영',
                  description: '소중한 순간을 작품으로',
                  icon: cameraIcon,
                  activeIcon: cameraActiveIcon,
                },
                {
                  name: '편집',
                  description: '사진의 분위기를 새롭게',
                  icon: editIcon,
                  activeIcon: editActiveIcon,
                },
              ].map((item) => {
                const active = help.includes(item.name);

                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`${styles.helpCard} ${active ? styles.helpCardActive : ''}`}
                    onClick={() => toggleItem(item.name, help, setHelp)}
                  >
                    <div className={styles.helpIcon}>
                      <img src={active ? item.activeIcon : item.icon} alt="" />
                    </div>

                    <div className={styles.helpText}>
                      <strong>{item.name}</strong>
                      <span>{item.description}</span>
                    </div>

                    <span className={`${styles.check} ${active ? styles.checked : ''}`}>
                      {active ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className={styles.stepLabel}>취향 찾기</p>

            <h1 className={styles.title}>
              좋아하는 사진 스타일을
              <br />
              골라주세요
            </h1>

            <p className={styles.description}>선택한 태그로 취향에 맞는 전문가를 추천해 드려요.</p>

            <div className={styles.styleGrid}>
              {photoStyles.map((item) => {
                const active = selectedStyles.includes(item);

                return (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={active}
                    className={`${styles.styleCard} ${active ? styles.styleCardActive : ''}`}
                    onClick={() => toggleItem(item, selectedStyles, setSelectedStyles)}
                  >
                    <span className={styles.styleName}>{item}</span>

                    {active && <span className={styles.styleCheck}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className={styles.stepLabel}>마지막 단계</p>

            <h1 className={styles.title}>프로필을 완성해 주세요</h1>

            <p className={styles.description}>
              전문가와 원활하게 소통할 수 있도록
              <br />
              기본 정보를 입력해주세요.
            </p>

            <div className={styles.profilePhotoArea}>
              <div className={styles.profilePhotoWrap}>
                <button
                  type="button"
                  className={styles.profilePhoto}
                  onClick={() => photoInput.current?.click()}
                  aria-label="프로필 사진 등록"
                >
                  <img
                    src={photo || humanIcon}
                    alt="프로필 사진"
                    className={photo ? styles.uploadedPhoto : styles.profileHuman}
                  />
                </button>

                <button
                  type="button"
                  className={styles.profileCamera}
                  onClick={() => photoInput.current?.click()}
                  aria-label="프로필 사진 변경"
                >
                  <img src={cameraIcon} alt="" />
                </button>
              </div>

              <input ref={photoInput} type="file" accept="image/*" onChange={uploadPhoto} hidden />

              <button
                type="button"
                className={styles.photoButton}
                onClick={() => photoInput.current?.click()}
              >
                사진 등록하기
              </button>
            </div>

            <div className={styles.profileForm}>
              <label className={styles.formRow}>
                <span>닉네임</span>
                <input
                  type="text"
                  placeholder="닉네임 입력"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                />
              </label>

              <label className={styles.formRow}>
                <span>생년월일</span>
                <input
                  type="date"
                  value={birthDate}
                  max={maxBirthDate}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (!value || value <= maxBirthDate) {
                      setBirthDate(value);
                    }
                  }}
                />
              </label>

              <div className={styles.formRow}>
                <span>성별</span>

                <div className={styles.genderOptions}>
                  {['여성', '남성', '선택 안함'].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={`${styles.genderButton} ${
                        gender === item ? styles.genderActive : ''
                      }`}
                      onClick={() => setGender(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.formRow}>
                <span>전화번호</span>
                <input
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>

              <div className={styles.formRow}>
                <span>사진 스타일</span>
                <p>
                  {selectedStyles.length > 0 ? selectedStyles.join(', ') : '선택한 스타일 없음'}
                </p>
              </div>
            </div>

            {!phoneValid && <p className={styles.error}>전화번호 형식을 확인해주세요.</p>}
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.nextButton} disabled={!canNext} onClick={nextStep}>
          {step === 3 ? '시작하기' : '다음'}
        </button>
      </footer>
    </main>
  );
}
