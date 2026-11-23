/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 카카오 REST API 키 (인가 URL의 client_id, 공개 식별자)
  readonly VITE_KAKAO_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
