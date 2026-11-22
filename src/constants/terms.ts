// PIC:ON 서비스 약관 (팀 노션 "PIC:ON 서비스 약관" 시연용 초안)
// 마이페이지 약관 및 정책 화면에서 사용. 온보딩 약관 동의에서도 같은 내용을 쓸 수 있도록 한곳에 모아 둠
// TODO: 실제 운영 전 운영 주체 · 문의처 · 시행일 확정 후 수정

export type TermsId = 'service' | 'privacy' | 'marketing';

export type TermsBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  // "운영 주체: ..."처럼 이름과 내용이 짝인 줄
  | { type: 'labeled'; label: string; text: string };

export interface TermsSection {
  heading: string;
  blocks: TermsBlock[];
}

export interface TermsDocument {
  id: TermsId;
  title: string;
  required: boolean;
  // 맨 위 안내 문구 (초안 안내)
  notice: string;
  sections: TermsSection[];
}

export const TERMS: TermsDocument[] = [
  {
    id: 'service',
    title: '서비스 이용약관 동의',
    required: true,
    notice:
      'PIC 프로젝트 시연용 약관 초안입니다. 실제 서비스 운영 전 운영 주체와 적용일을 확정해야 합니다.',
    sections: [
      {
        heading: '제1조 (목적)',
        blocks: [
          {
            type: 'paragraph',
            text: '본 약관은 PIC(이하 ‘서비스’)에서 제공하는 사진 촬영·편집 전문가 탐색, 포트폴리오 열람, 의뢰 및 콘테스트 관련 기능의 이용 조건과 이용자 및 서비스 운영자의 권리·의무를 정하는 것을 목적으로 합니다.',
          },
        ],
      },
      {
        heading: '제2조 (서비스 내용)',
        blocks: [
          {
            type: 'paragraph',
            text: '서비스는 개발 및 운영 범위에 따라 다음 기능을 제공할 수 있습니다.',
          },
          {
            type: 'list',
            items: [
              '사진 촬영·편집 전문가 및 포트폴리오 검색·열람',
              '관심 분야·사진 스타일에 따른 전문가 추천',
              '전문가에게 의뢰 요청 및 제안 내용 확인',
              '사진 콘테스트 참가 작품 열람, 투표 및 결과 확인',
              '프로필, 후기 및 기타 커뮤니티 관련 기능',
            ],
          },
          {
            type: 'paragraph',
            text: '기능별 제공 여부와 세부 이용 방법은 서비스 화면의 안내를 따르며, 개발 중인 기능은 실제로 제공되지 않을 수 있습니다.',
          },
        ],
      },
      {
        heading: '제3조 (회원가입 및 계정 관리)',
        blocks: [
          {
            type: 'paragraph',
            text: '이용자는 정확한 정보를 입력해야 하며, 자신의 계정을 안전하게 관리해야 합니다. 타인의 정보 도용, 계정 무단 사용 및 허위 정보 등록은 금지됩니다. 외부 로그인 연동 시 해당 제공자의 정책이 추가로 적용될 수 있습니다.',
          },
        ],
      },
      {
        heading: '제4조 (전문가 의뢰 및 거래)',
        blocks: [
          {
            type: 'paragraph',
            text: '의뢰 내용, 작업 범위, 일정 및 비용 등은 실제 제공되는 기능과 당사자 간 확인 내용에 따라 결정됩니다. 결제·환불·취소 및 분쟁 처리에 관한 구체적인 기준은 해당 기능 도입 전에 별도 정책으로 안내할 예정입니다.',
          },
        ],
      },
      {
        heading: '제5조 (콘테스트 및 콘텐츠)',
        blocks: [
          {
            type: 'paragraph',
            text: '이용자는 자신이 권리를 보유하거나 적법한 사용 권한이 있는 사진과 콘텐츠만 등록해야 합니다. 타인의 저작권·초상권·개인정보를 침해하거나 부정한 방식으로 투표에 참여해서는 안 됩니다. 콘테스트의 일정, 심사 및 수상 기준은 각 콘테스트 안내에서 별도로 정합니다.',
          },
        ],
      },
      {
        heading: '제6조 (이용 제한 및 서비스 변경)',
        blocks: [
          {
            type: 'paragraph',
            text: '법령 위반, 타인에 대한 권리 침해, 서비스 운영 방해 등의 행위가 확인되면 관련 정책과 법령에 따라 이용이 제한될 수 있습니다. 서비스 기능의 변경이나 중단이 필요한 경우에는 가능한 범위에서 사전에 안내합니다.',
          },
        ],
      },
      {
        heading: '제7조 (문의 및 시행)',
        blocks: [
          { type: 'labeled', label: '운영 주체', text: '[운영자/사업자명 확정 필요]' },
          { type: 'labeled', label: '문의처', text: '[고객 문의 이메일 확정 필요]' },
          { type: 'labeled', label: '시행일', text: '[실제 적용일 확정 필요]' },
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: '개인정보 수집·이용 동의',
    required: true,
    notice:
      '아래 내용은 현재 온보딩 화면의 입력 항목을 기준으로 작성한 시연용 초안입니다. 실제 수집·저장 방식 및 보유 기간은 백엔드 정책에 맞춰 확정해야 합니다.',
    sections: [
      {
        heading: '1. 개인정보 수집·이용 목적',
        blocks: [
          {
            type: 'list',
            items: [
              '회원 식별 및 서비스 이용을 위한 프로필 구성',
              '촬영·편집 관심 분야와 선호 스타일에 따른 맞춤형 콘텐츠 제공',
              '전문가 의뢰 및 이용자 간 소통 기능 지원(기능 제공 시)',
              '서비스 이용 관련 안내 및 문의 대응',
            ],
          },
        ],
      },
      {
        heading: '2. 수집 항목',
        blocks: [
          {
            type: 'labeled',
            label: '필수 설정 정보',
            text: '닉네임, 관심 서비스 분야(촬영/편집), 선호 사진 스타일',
          },
          {
            type: 'labeled',
            label: '선택 입력 정보',
            text: '프로필 사진, 생년월일, 성별, 전화번호',
          },
          {
            type: 'labeled',
            label: '로그인 연동 시',
            text: '카카오 등 외부 로그인 제공자로부터 전달받는 회원 식별 정보. 실제 수집 범위는 로그인 연동 및 동의 화면에 표시되는 항목을 기준으로 별도 확정합니다.',
          },
        ],
      },
      {
        heading: '3. 보유 및 이용 기간',
        blocks: [
          {
            type: 'paragraph',
            text: '실제 운영 시 원칙적으로 회원 탈퇴 또는 수집 목적 달성 시까지 보유하고, 법령에 따라 보존이 필요한 정보는 해당 법정 기간 동안 별도로 보관하는 방안을 기준으로 합니다. 현재 시연 화면은 서버 저장이 연결되지 않았으며, 실제 보유 기간과 삭제 절차는 운영 정책 확정 후 고지해야 합니다.',
          },
        ],
      },
      {
        heading: '4. 동의 거부 권리',
        blocks: [
          {
            type: 'paragraph',
            text: '필수 정보의 수집·이용에 동의하지 않으면 회원가입 및 맞춤형 서비스 이용이 제한될 수 있습니다. 선택 입력 정보는 제공하지 않아도 기본 온보딩을 진행할 수 있습니다.',
          },
        ],
      },
      {
        heading: '5. 개인정보 관련 문의',
        blocks: [
          { type: 'labeled', label: '개인정보 처리 주체', text: '[운영자/사업자명 확정 필요]' },
          { type: 'labeled', label: '개인정보 문의처', text: '[담당 이메일 확정 필요]' },
          { type: 'labeled', label: '시행일', text: '[실제 적용일 확정 필요]' },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    title: '이벤트 및 혜택 알림 수신 동의',
    required: false,
    notice:
      '이벤트·혜택 안내 기능을 도입할 경우 적용할 선택 동의 초안입니다. 현재 시연에서는 실제 마케팅 알림을 발송하지 않습니다.',
    sections: [
      {
        heading: '1. 안내 내용',
        blocks: [
          {
            type: 'paragraph',
            text: 'PIC에서 진행하는 사진 콘테스트, 신규 이벤트, 서비스 소식, 프로모션 및 혜택 관련 정보를 안내할 수 있습니다.',
          },
        ],
      },
      {
        heading: '2. 안내 방법',
        blocks: [
          {
            type: 'paragraph',
            text: '앱 내 알림 등 실제 서비스에 구현된 채널을 통해 안내할 예정입니다. 이메일·문자 등 추가 채널을 이용하는 경우에는 수신 정보와 채널별 동의 방식을 별도로 안내해야 합니다.',
          },
        ],
      },
      {
        heading: '3. 동의 여부 및 철회',
        blocks: [
          {
            type: 'paragraph',
            text: '본 항목은 선택 사항이며, 동의하지 않아도 회원가입과 기본 서비스 이용에 불이익이 없습니다. 실제 운영 시에는 마이페이지의 알림 설정 또는 별도 문의 채널을 통해 수신 동의를 철회할 수 있도록 제공할 예정입니다.',
          },
        ],
      },
      {
        heading: '4. 적용 안내',
        blocks: [
          {
            type: 'paragraph',
            text: '수신 동의의 기록·보유 기간, 발송 채널 및 운영 주체 정보는 기능 도입 전 확정하여 안내합니다.',
          },
        ],
      },
    ],
  },
];
