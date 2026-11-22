import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import cameraIcon from '../assets/icons/onboarding/camera.svg';
import humanIcon from '../assets/icons/onboarding/human.svg';
import { type Gender, type MyProfileInfo, useMyProfile } from '../hooks/useMyProfile';
import styles from './MyProfileEditPage.module.css';

// 입력 칸 값 (사진은 따로 관리)
type ProfileForm = Omit<MyProfileInfo, 'profileImageUrl'>;

const GENDERS: Gender[] = ['여성', '남성', '선택 안함'];
const NICKNAME_MAX = 10;
const INTRODUCTION_MAX = 40;

// 온보딩과 같은 전화번호 형식 (비워 두는 것도 허용)
const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;

// 오늘 이후 날짜는 생년월일로 고를 수 없게 (기기 시간대 기준 오늘)
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function MyProfileEditPage() {
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement>(null);
  // 지금 저장된 프로필을 처음 값으로 → 저장하면 마이페이지에도 반영
  const { profile, saveProfile } = useMyProfile();
  const { profileImageUrl: savedPhotoUrl, ...savedForm } = profile;
  const [form, setForm] = useState<ProfileForm>(savedForm);
  // 새로 고른 사진 파일과 미리 보기 주소
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // 저장한 미리 보기 주소는 마이페이지에서 계속 쓰므로 정리하지 않음
  const savedPreview = useRef<string | null>(null);

  // 미리 보기 주소는 사진을 바꾸거나 저장하지 않고 화면을 나갈 때 정리
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview !== savedPreview.current) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 onChange가 오도록 비움
    event.target.value = '';
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const nicknameValid = form.nickname.trim().length > 0;
  const phoneValid = form.phone.trim() === '' || PHONE_PATTERN.test(form.phone.trim());
  const changed =
    photoFile !== null ||
    (Object.keys(form) as (keyof ProfileForm)[]).some((key) => form[key] !== savedForm[key]);
  const canSave = nicknameValid && phoneValid && changed;

  const save = () => {
    if (!canSave) return;
    // TODO: API 연동 시
    //   1) 사진을 바꿨으면 uploadPhoto(src/api/uploads.ts)로 Pre-signed URL 업로드 → 파일 key 받기
    //   2) client로 프로필 수정 요청 (닉네임 · 소개 · 생년월일 · 성별 · 전화번호 · 사진 key)
    savedPreview.current = photoPreview;
    saveProfile({
      ...form,
      nickname: form.nickname.trim(),
      introduction: form.introduction.trim(),
      phone: form.phone.trim(),
      profileImageUrl: photoPreview ?? savedPhotoUrl,
    });
    navigate('/my');
  };

  const photoUrl = photoPreview ?? savedPhotoUrl;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>프로필 수정</h1>
      </header>

      <div className={styles.photoArea}>
        <div className={styles.photoWrap}>
          <button
            type="button"
            className={styles.photo}
            onClick={() => photoInput.current?.click()}
            aria-label="프로필 사진 변경"
          >
            <img
              src={photoUrl || humanIcon}
              alt=""
              className={photoUrl ? styles.photoImage : styles.photoPlaceholder}
            />
          </button>
          <span className={styles.camera} aria-hidden="true">
            <img src={cameraIcon} alt="" />
          </span>
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          onChange={choosePhoto}
          hidden
          aria-hidden="true"
        />
        <button
          type="button"
          className={styles.photoButton}
          onClick={() => photoInput.current?.click()}
        >
          사진 변경
        </button>
      </div>

      <div className={styles.form}>
        <label className={styles.row}>
          <span className={styles.rowLabel}>
            닉네임<span className={styles.required}>*</span>
          </span>
          <input
            type="text"
            value={form.nickname}
            maxLength={NICKNAME_MAX}
            placeholder="닉네임 입력"
            onChange={(event) => updateField('nickname', event.target.value)}
          />
        </label>

        <label className={styles.row}>
          <span className={styles.rowLabel}>한 줄 소개</span>
          <input
            type="text"
            value={form.introduction}
            maxLength={INTRODUCTION_MAX}
            placeholder="나를 소개하는 한 줄"
            onChange={(event) => updateField('introduction', event.target.value)}
          />
        </label>

        <label className={styles.row}>
          <span className={styles.rowLabel}>생년월일</span>
          <input
            type="date"
            value={form.birthDate}
            max={todayString()}
            onChange={(event) => updateField('birthDate', event.target.value)}
          />
        </label>

        <div className={styles.row}>
          <span className={styles.rowLabel} id="gender-label">
            성별
          </span>
          <div className={styles.genderOptions} role="radiogroup" aria-labelledby="gender-label">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                type="button"
                role="radio"
                aria-checked={form.gender === gender}
                className={
                  form.gender === gender
                    ? `${styles.genderButton} ${styles.genderActive}`
                    : styles.genderButton
                }
                onClick={() => updateField('gender', gender)}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.row}>
          <span className={styles.rowLabel}>전화번호</span>
          <input
            type="tel"
            value={form.phone}
            placeholder="010-1234-5678"
            onChange={(event) => updateField('phone', event.target.value)}
          />
        </label>
      </div>

      <div className={styles.messages} aria-live="polite">
        {!nicknameValid && <p className={styles.error}>닉네임을 입력해 주세요.</p>}
        {!phoneValid && <p className={styles.error}>전화번호 형식을 확인해 주세요.</p>}
      </div>

      <button type="button" className={styles.saveButton} disabled={!canSave} onClick={save}>
        저장하기
      </button>
    </main>
  );
}
