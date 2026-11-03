# picon-frontend

**PIC:ON** — 나만의 순간을 더 특별하게 📸

졸업·커플·여행·프로필 사진 등을 신진 사진가와 연결해주는 사진 촬영 매칭 플랫폼의 프론트엔드입니다.

## 기술 스택

- React + Vite + TypeScript (모바일 앱처럼 보이는 웹앱, PWA)
- React Router, TanStack Query (예정)

## 처음 시작하기

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173/ 접속

## 주의

- TypeScript는 `~6.0.0`으로 고정되어 있습니다. (typescript-eslint 호환 문제로 올리지 마세요)

## 협업 규칙

브랜치·커밋·PR·코드 스타일 규칙은 **[CONTRIBUTING.md](./CONTRIBUTING.md)** 를 꼭 읽어주세요.
Claude Code로 작업하면 [CLAUDE.md](./CLAUDE.md)가 자동으로 적용돼요.

## 배포 / 인프라 참고

| 항목           | 값                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------ |
| 빌드 명령      | `npm ci && npm run build`                                                                  |
| 빌드 결과 폴더 | `dist/` (Nginx에 복사)                                                                     |
| Node 버전      | 26 (`.nvmrc`, `package.json` engines)                                                      |
| 라우팅         | SPA (React Router 예정) → Nginx에 `try_files $uri $uri/ /index.html;` 필요                 |
| API 호출       | `/api` 상대 경로 → Nginx가 Spring Boot(8080)로 프록시                                      |
| 비밀값         | 프론트 코드·빌드 환경 변수에 넣지 않음 (백엔드에서만 관리)                                 |
| 이미지 업로드  | 백엔드 발급 Pre-signed URL로 브라우저가 S3에 직접 `PUT` (도메인 확정 후 S3 CORS 등록 요청) |
