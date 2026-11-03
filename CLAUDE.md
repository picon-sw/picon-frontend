# CLAUDE.md

PIC:ON 프론트엔드 (사진가 매칭 플랫폼, 모바일 웹앱). 팀원 3명이 직접 또는 각자 Claude로 작업합니다.
**팀 규칙 전체는 [`README.md`](./README.md)에 있으니 작업 전에 반드시 읽고 따를 것.** 아래는 특히 어기면 안 되는 핵심입니다.

## 반드시 지킬 것

- 브랜치: 최신 `develop`에서 `type/이슈번호-내용` (영문 소문자+하이픈, `#` 없음. 예: `feat/12-login-page`)
- 커밋·PR 제목·이슈 제목: `type: 한글 설명` — type: feat, fix, refactor, style, docs, test, chore
- PR 대상은 `develop`, 본문은 `.github/pull_request_template.md` 형식
- **금지**: `main`/`develop` 직접 push, PR merge, force push, `--no-verify`. 커밋·push·PR은 사용자가 요청할 때만
- API는 `src/api/client.ts`의 `client`로 `/api` 상대 경로 호출. 서버 주소 하드코딩 금지
- Secret·API Key·토큰을 프론트 코드나 `.env`(`VITE_*` 포함)에 넣지 말 것. LLM은 반드시 `/api` 경유
- 이미지: S3 비공개. Pre-signed URL로 업로드(`fetch` PUT)·조회, URL 장기 저장 금지
- 카카오 로그인 토큰 교환은 백엔드. 토큰 localStorage 저장 금지
- 정적 SPA(Nginx 서빙) — SSR/Next.js 도입 금지
- 스타일링·전역 상태 라이브러리는 미정 → 임의 설치 금지, 새 패키지는 사용자 확인 후
- TypeScript `~6.0.0` 고정
- 요청 범위 밖 파일(다른 팀원 담당 화면 등) 수정 금지

## 코드

- 화면: `src/pages/XxxPage.tsx`, 라우트는 `src/App.tsx`에 추가
- 컴포넌트: `function` 선언 + named export, props 타입 `XxxProps`, `any` 금지
- 공통 컴포넌트 만들기 전 `src/components/`에 있는지 확인 후 재사용
- 포맷은 Prettier에 맡김. 작업 끝나면 `npm run lint`, `npm run build` 통과 확인

## Figma

- Figma 링크를 받아 구현할 때도 위 규칙과 폴더·네이밍에 맞게 재구성하고 기존 컴포넌트를 우선 사용
