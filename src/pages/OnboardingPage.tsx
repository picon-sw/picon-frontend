import axios from 'axios';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { startKakaoLogin } from '../api/auth';
import { setOnboarded } from '../api/authStore';
import {
  completeOnboarding,
  MAX_MOODS,
  MOODS,
  NICKNAME_MAX_LENGTH,
  type ServiceType,
} from '../api/members';
import styles from './OnboardingPage.module.css';

import loginBg from '../assets/icons/onboarding/login_bg.svg';
import kakaoIcon from '../assets/icons/onboarding/kakao.svg';
import cameraIcon from '../assets/icons/onboarding/camera.svg';
import cameraActiveIcon from '../assets/icons/onboarding/camera.active.svg';
import editIcon from '../assets/icons/onboarding/edit.svg';
import editActiveIcon from '../assets/icons/onboarding/edit.active.svg';
import humanIcon from '../assets/icons/onboarding/human.svg';
import brightPhoto from '../assets/icons/onboarding/01_bright.jpg';
import naturalPhoto from '../assets/icons/onboarding/02_natural.jpg';
import calmPhoto from '../assets/icons/onboarding/03_calm.jpg';
import sophisticatedPhoto from '../assets/icons/onboarding/04_sophisticated.jpg';
import dreamyPhoto from '../assets/icons/onboarding/05_dreamy.jpg';
import uniquePhoto from '../assets/icons/onboarding/06_unique.jpg';
import dramaticPhoto from '../assets/icons/onboarding/07_dramatic.jpg';

// 화면에는 한글 이름, 저장할 때는 MOODS의 코드(BRIGHT 등)로 바꿔 보냄
const photoStyles = MOODS.map((mood) => mood.label);

const photoStyleImages: Record<string, string> = {
  밝음: brightPhoto,
  자연스러움: naturalPhoto,
  차분함: calmPhoto,
  세련됨: sophisticatedPhoto,
  몽환적: dreamyPhoto,
  개성적: uniquePhoto,
  '극적 표현': dramaticPhoto,
};

// 약관: /onboarding/terms → 기존 3단계: help → style → profile
const steps = ['help', 'style', 'profile'];

// 도움 유형 선택값 → API 값 (둘 다 고르면 SHOOTING_EDITING)
function toServiceType(help: string[]): ServiceType {
  const shooting = help.includes('촬영');
  const editing = help.includes('편집');
  if (shooting && editing) return 'SHOOTING_EDITING';
  return shooting ? 'SHOOTING' : 'EDITING';
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { step: stepName } = useParams();
  const photoInput = useRef<HTMLInputElement>(null);

  // 로그인과 약관 화면은 기존 온보딩 3단계에 포함하지 않음
  const isTerms = stepName === 'terms';
  const step = stepName === undefined || isTerms ? 0 : steps.indexOf(stepName) + 1 || -1;

  const [help, setHelp] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');

  // 약관 동의 (필수 2개, 선택 1개)
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 안내 문구는 2초 뒤 사라짐
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const allAgreed = serviceAgreed && privacyAgreed && marketingAgreed;
  const requiredAgreed = serviceAgreed && privacyAgreed;

  function toggleAllTerms() {
    const next = !allAgreed;
    setServiceAgreed(next);
    setPrivacyAgreed(next);
    setMarketingAgreed(next);
  }

  function finishTerms() {
    if (!requiredAgreed) return;
    // TODO: 백엔드 연동 시 필수/선택 약관 버전과 동의 시각 저장
    setTermsAccepted(true);
    navigate('/onboarding/help');
  }

  // 어제 날짜 (생년월일은 오늘 이전만 저장 가능)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxBirthDate = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, '0'),
    String(yesterday.getDate()).padStart(2, '0'),
  ].join('-');

  function toggleItem(item: string, selected: string[], update: (items: string[]) => void) {
    if (selected.includes(item)) {
      update(selected.filter((value) => value !== item));
    } else {
      update([...selected, item]);
    }
  }

  function goBack() {
    // 주소로 바로 들어온 경우엔 돌아갈 기록이 없으니 이전 단계로 이동
    if (location.key === 'default') {
      navigate(step === 1 ? '/onboarding/terms' : `/onboarding/${steps[step - 2]}`);
    } else {
      navigate(-1);
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

  // 사진 분위기는 최대 3개까지
  function toggleStyle(item: string) {
    if (!selectedStyles.includes(item) && selectedStyles.length >= MAX_MOODS) {
      setToast(`최대 ${MAX_MOODS}개까지 고를 수 있어요`);
      return;
    }
    toggleItem(item, selectedStyles, setSelectedStyles);
  }

  // 약관 동의부터 프로필까지 한 번에 저장
  async function saveOnboarding() {
    setSaving(true);
    try {
      await completeOnboarding({
        termsAgreed: serviceAgreed,
        privacyAgreed,
        marketingAgreed,
        serviceType: toServiceType(help),
        moods: MOODS.filter((mood) => selectedStyles.includes(mood.label)).map((mood) => mood.code),
        nickname: nickname.trim(),
        birth: birthDate || null,
        gender: gender === '여성' ? 'FEMALE' : gender === '남성' ? 'MALE' : null,
        phoneNumber: phone.trim() ? phone.replace(/-/g, '') : null,
      });
    } catch (error) {
      // 409: 이미 온보딩을 끝낸 회원 → 홈으로
      if (!axios.isAxiosError(error) || error.response?.status !== 409) {
        setToast(
          axios.isAxiosError(error) && error.response?.status === 400
            ? '입력한 정보를 다시 확인해 주세요'
            : '저장하지 못했어요. 다시 시도해 주세요',
        );
        setSaving(false);
        return;
      }
    }

    setOnboarded(true);
    navigate('/', { replace: true });
  }

  function nextStep() {
    if (step < 3) {
      navigate(`/onboarding/${steps[step]}`);
      return;
    }
    void saveOnboarding();
  }

  const phoneValid = phone.trim() === '' || /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone);

  const canNext =
    step === 1
      ? help.length > 0
      : step === 2
        ? selectedStyles.length > 0
        : nickname.trim().length > 0 && phoneValid;

  // 없는 단계 주소는 로그인 화면으로
  if (step === -1) {
    return <Navigate to="/onboarding" replace />;
  }

  // 약관 동의 전에는 이후 단계로 진입할 수 없음
  if (step >= 1 && !termsAccepted) {
    return <Navigate to="/onboarding/terms" replace />;
  }

  // 새로고침 등으로 앞 단계 선택값이 없으면 첫 단계부터 다시
  if ((step >= 2 && help.length === 0) || (step === 3 && selectedStyles.length === 0)) {
    return <Navigate to="/onboarding/help" replace />;
  }

  if (step === 0 && !isTerms) {
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
          <button type="button" className={styles.kakaoButton} onClick={startKakaoLogin}>
            <img src={kakaoIcon} alt="" />
            카카오로 시작하기
          </button>

          <p>다음 단계에서 이용약관을 확인하고 동의할 수 있습니다.</p>
        </div>
      </main>
    );
  }

  // 약관 동의 화면 (기존 온보딩 1~3단계와 별도)
  if (isTerms) {
    return (
      <main className={styles.page}>
        <header className={styles.termsHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/onboarding')}
            aria-label="로그인 화면으로 돌아가기"
          >
            ‹
          </button>
          <span className={styles.termsHeaderTitle}>약관 동의</span>
        </header>

        <section className={styles.termsContent}>
          <p className={styles.stepLabel}>PIC:ON 시작하기</p>
          <h1 className={styles.title}>
            서비스 이용을 위해
            <br />
            약관에 동의해 주세요
          </h1>
          <p className={styles.description}>필수 항목에 동의하면 다음 단계로 넘어갈 수 있어요.</p>

          <label className={styles.termsAllRow}>
            <input
              type="checkbox"
              checked={allAgreed}
              onChange={toggleAllTerms}
              className={styles.termsCheckbox}
            />
            <span>
              <strong>전체 동의</strong>
              <small>선택 항목까지 모두 동의합니다.</small>
            </span>
          </label>

          <div className={styles.termsDivider} />

          <div className={styles.termsList}>
            {[
              {
                key: 'service',
                label: '서비스 이용약관 동의',
                required: true,
                checked: serviceAgreed,
                setChecked: setServiceAgreed,
              },
              {
                key: 'privacy',
                label: '개인정보 수집·이용 동의',
                required: true,
                checked: privacyAgreed,
                setChecked: setPrivacyAgreed,
              },
              {
                key: 'marketing',
                label: '이벤트 및 혜택 알림 수신 동의',
                required: false,
                checked: marketingAgreed,
                setChecked: setMarketingAgreed,
              },
            ].map((term) => (
              <div key={term.key} className={styles.termsItem}>
                <div className={styles.termsRow}>
                  <label className={styles.termsLabel}>
                    <input
                      type="checkbox"
                      checked={term.checked}
                      onChange={(event) => term.setChecked(event.target.checked)}
                      className={styles.termsCheckbox}
                    />
                    <span className={term.required ? styles.required : styles.optional}>
                      {term.required ? '[필수]' : '[선택]'}
                    </span>
                    <span>{term.label}</span>
                  </label>
                  <button
                    type="button"
                    className={styles.termsDetailButton}
                    aria-expanded={expandedTerm === term.key}
                    onClick={() => setExpandedTerm(expandedTerm === term.key ? null : term.key)}
                  >
                    {expandedTerm === term.key ? '닫기' : '보기'}
                  </button>
                </div>
                {expandedTerm === term.key && (
                  <div className={styles.termsDetail}>
                    {term.key === 'service' && (
                      <div className={styles.termsDocument}>
                        <p className={styles.termsDraftNotice}>
                          PIC:ON 프로젝트 시연용 약관 초안입니다. 실제 서비스 운영 전 운영 주체와
                          적용일을 확정해야 합니다.
                        </p>
                        <h2>제1조 (목적)</h2>
                        <p>
                          본 약관은 PIC:ON(이하 ‘서비스’)에서 제공하는 사진 촬영·편집 전문가 탐색,
                          포트폴리오 열람, 의뢰 및 콘테스트 관련 기능의 이용 조건과 이용자 및 서비스
                          운영자의 권리·의무를 정하는 것을 목적으로 합니다.
                        </p>
                        <h2>제2조 (서비스 내용)</h2>
                        <p>서비스는 개발 및 운영 범위에 따라 다음 기능을 제공할 수 있습니다.</p>
                        <ul>
                          <li>사진 촬영·편집 전문가 및 포트폴리오 검색·열람</li>
                          <li>관심 분야·사진 스타일에 따른 전문가 추천</li>
                          <li>전문가에게 의뢰 요청 및 제안 내용 확인</li>
                          <li>사진 콘테스트 참가 작품 열람, 투표 및 결과 확인</li>
                          <li>프로필, 후기 및 기타 커뮤니티 관련 기능</li>
                        </ul>
                        <p>
                          기능별 제공 여부와 세부 이용 방법은 서비스 화면의 안내를 따르며, 개발 중인
                          기능은 실제로 제공되지 않을 수 있습니다.
                        </p>
                        <h2>제3조 (회원가입 및 계정 관리)</h2>
                        <p>
                          이용자는 정확한 정보를 입력해야 하며, 자신의 계정을 안전하게 관리해야
                          합니다. 타인의 정보 도용, 계정 무단 사용 및 허위 정보 등록은 금지됩니다.
                          외부 로그인 연동 시 해당 제공자의 정책이 추가로 적용될 수 있습니다.
                        </p>
                        <h2>제4조 (전문가 의뢰 및 거래)</h2>
                        <p>
                          의뢰 내용, 작업 범위, 일정 및 비용 등은 실제 제공되는 기능과 당사자 간
                          확인 내용에 따라 결정됩니다. 결제·환불·취소 및 분쟁 처리에 관한 구체적인
                          기준은 해당 기능 도입 전에 별도 정책으로 안내할 예정입니다.
                        </p>
                        <h2>제5조 (콘테스트 및 콘텐츠)</h2>
                        <p>
                          이용자는 자신이 권리를 보유하거나 적법한 사용 권한이 있는 사진과 콘텐츠만
                          등록해야 합니다. 타인의 저작권·초상권·개인정보를 침해하거나 부정한
                          방식으로 투표에 참여해서는 안 됩니다. 콘테스트의 일정, 심사 및 수상 기준은
                          각 콘테스트 안내에서 별도로 정합니다.
                        </p>
                        <h2>제6조 (이용 제한 및 서비스 변경)</h2>
                        <p>
                          법령 위반, 타인에 대한 권리 침해, 서비스 운영 방해 등의 행위가 확인되면
                          관련 정책과 법령에 따라 이용이 제한될 수 있습니다. 서비스 기능의 변경이나
                          중단이 필요한 경우에는 가능한 범위에서 사전에 안내합니다.
                        </p>
                        <h2>제7조 (문의 및 시행)</h2>
                        <p>
                          운영 주체: [운영자/사업자명 확정 필요]
                          <br />
                          문의처: [고객 문의 이메일 확정 필요]
                          <br />
                          시행일: [실제 적용일 확정 필요]
                        </p>
                      </div>
                    )}
                    {term.key === 'privacy' && (
                      <div className={styles.termsDocument}>
                        <p className={styles.termsDraftNotice}>
                          아래 내용은 현재 온보딩 화면의 입력 항목을 기준으로 작성한 시연용
                          초안입니다. 실제 수집·저장 방식 및 보유 기간은 백엔드 정책에 맞춰 확정해야
                          합니다.
                        </p>
                        <h2>1. 개인정보 수집·이용 목적</h2>
                        <ul>
                          <li>회원 식별 및 서비스 이용을 위한 프로필 구성</li>
                          <li>촬영·편집 관심 분야와 선호 스타일에 따른 맞춤형 콘텐츠 제공</li>
                          <li>전문가 의뢰 및 이용자 간 소통 기능 지원(기능 제공 시)</li>
                          <li>서비스 이용 관련 안내 및 문의 대응</li>
                        </ul>
                        <h2>2. 수집 항목</h2>
                        <p>
                          <strong>필수 설정 정보:</strong> 닉네임, 관심 서비스 분야(촬영/편집), 선호
                          사진 스타일
                        </p>
                        <p>
                          <strong>선택 입력 정보:</strong> 프로필 사진, 생년월일, 성별, 전화번호
                        </p>
                        <p>
                          <strong>로그인 연동 시:</strong> 카카오 등 외부 로그인 제공자로부터
                          전달받는 회원 식별 정보. 실제 수집 범위는 로그인 연동 및 동의 화면에
                          표시되는 항목을 기준으로 별도 확정합니다.
                        </p>
                        <h2>3. 보유 및 이용 기간</h2>
                        <p>
                          실제 운영 시 원칙적으로 회원 탈퇴 또는 수집 목적 달성 시까지 보유하고,
                          법령에 따라 보존이 필요한 정보는 해당 법정 기간 동안 별도로 보관하는
                          방안을 기준으로 합니다. 현재 시연 화면은 서버 저장이 연결되지 않았으며,
                          실제 보유 기간과 삭제 절차는 운영 정책 확정 후 고지해야 합니다.
                        </p>
                        <h2>4. 동의 거부 권리</h2>
                        <p>
                          필수 정보의 수집·이용에 동의하지 않으면 회원가입 및 맞춤형 서비스 이용이
                          제한될 수 있습니다. 선택 입력 정보는 제공하지 않아도 기본 온보딩을 진행할
                          수 있습니다.
                        </p>
                        <h2>5. 개인정보 관련 문의</h2>
                        <p>
                          개인정보 처리 주체: [운영자/사업자명 확정 필요]
                          <br />
                          개인정보 문의처: [담당 이메일 확정 필요]
                          <br />
                          시행일: [실제 적용일 확정 필요]
                        </p>
                      </div>
                    )}
                    {term.key === 'marketing' && (
                      <div className={styles.termsDocument}>
                        <p className={styles.termsDraftNotice}>
                          이벤트·혜택 안내 기능을 도입할 경우 적용할 선택 동의 초안입니다. 현재
                          시연에서는 실제 마케팅 알림을 발송하지 않습니다.
                        </p>
                        <h2>1. 안내 내용</h2>
                        <p>
                          PIC:ON에서 진행하는 사진 콘테스트, 신규 이벤트, 서비스 소식, 프로모션 및
                          혜택 관련 정보를 안내할 수 있습니다.
                        </p>
                        <h2>2. 안내 방법</h2>
                        <p>
                          앱 내 알림 등 실제 서비스에 구현된 채널을 통해 안내할 예정입니다.
                          이메일·문자 등 추가 채널을 이용하는 경우에는 수신 정보와 채널별 동의
                          방식을 별도로 안내해야 합니다.
                        </p>
                        <h2>3. 동의 여부 및 철회</h2>
                        <p>
                          본 항목은 선택 사항이며, 동의하지 않아도 회원가입과 기본 서비스 이용에
                          불이익이 없습니다. 실제 운영 시에는 마이페이지의 알림 설정 또는 별도 문의
                          채널을 통해 수신 동의를 철회할 수 있도록 제공할 예정입니다.
                        </p>
                        <h2>4. 적용 안내</h2>
                        <p>
                          수신 동의의 기록·보유 기간, 발송 채널 및 운영 주체 정보는 기능 도입 전
                          확정하여 안내합니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className={styles.termsNotice}>
            선택 항목에 동의하지 않아도 PIC:ON을 이용할 수 있습니다.
          </p>
        </section>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.nextButton}
            disabled={!requiredAgreed}
            onClick={finishTerms}
          >
            동의하고 계속하기
          </button>
        </footer>
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

            <p className={styles.description}>
              최대 {MAX_MOODS}개까지 고를 수 있어요.
              <br />
              선택한 태그로 취향에 맞는 전문가를 추천해 드려요.
            </p>

            <div className={styles.styleGrid}>
              {photoStyles.map((item) => {
                const active = selectedStyles.includes(item);

                return (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={active}
                    className={`${styles.styleCard} ${active ? styles.styleCardActive : ''}`}
                    onClick={() => toggleStyle(item)}
                  >
                    <img className={styles.stylePhoto} src={photoStyleImages[item]} alt="" />
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
                  maxLength={NICKNAME_MAX_LENGTH}
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
        <button
          type="button"
          className={styles.nextButton}
          disabled={!canNext || saving}
          onClick={nextStep}
        >
          {step === 3 ? '시작하기' : '다음'}
        </button>
      </footer>

      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}
    </main>
  );
}
