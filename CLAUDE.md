# CLAUDE.md

PIC:ON 프론트엔드 (사진가 매칭 플랫폼, 모바일 웹앱/PWA). 팀원 3명이 각자 Claude로도 작업합니다.
**전체 규칙은 [`CONTRIBUTING.md`](./CONTRIBUTING.md)에 있고, 이 파일은 AI가 반드시 지킬 핵심만 담습니다.**

## Stack

- Vite + React 19 + TypeScript (`~6.0.0` 고정 — 버전 올리지 말 것)
- ESLint + Prettier, husky + lint-staged (pre-commit), GitHub Actions CI
- 예정: React Router, TanStack Query. 스타일링·전역 상태 라이브러리는 미정 → **임의로 설치하지 말고 사용자에게 물어볼 것**

## Commands

```bash
npm run dev          # 개발 서버
npm run lint         # / lint:fix
npm run format       # Prettier 전체 적용
npm run build        # tsc -b + vite build — 작업 끝나면 반드시 통과 확인
```

## Git 규칙 (반드시)

- 작업 브랜치: 최신 `develop`에서 `type/이슈번호-내용` (영문 소문자+하이픈, `#` 없음. 예: `feat/12-login-page`)
- 커밋·PR 제목·이슈 제목: `type: 한글 설명` (예: `feat: 의뢰 등록 화면 추가`) — type: feat, fix, refactor, docs, style, test, chore
- PR 대상은 `develop`. PR 본문은 `.github/pull_request_template.md` 형식을 채울 것
- **금지**: `main`/`develop`에 직접 push, PR merge, force push, `--no-verify`로 훅 우회
- 커밋·push·PR 생성은 사용자가 요청했을 때만

## 인프라 합의 (반드시)

- API는 항상 `/api` 상대 경로로 호출. `http://localhost:8080` 같은 서버 주소 하드코딩 금지 (로컬은 Vite proxy가 처리)
- Secret·API Key·토큰을 프론트 코드나 `.env`(`VITE_*` 포함)에 넣지 말 것 — 빌드 결과는 브라우저에 공개됨
- 이미지 업로드: 백엔드에서 Pre-signed URL 발급 → 브라우저가 S3에 직접 `PUT`
- 빌드 결과 폴더는 `dist/`, Node 버전은 `.nvmrc`. 설치는 `npm ci`, `package-lock.json`은 항상 커밋

## 코드 규칙

- 폴더: `components/`(공통 UI) · `pages/`(화면, `XxxPage.tsx`) · `hooks/`(`useXxx.ts`) · `api/` · `stores/` · `types/` · `utils/` · `assets/`
- 컴포넌트: `function` 선언 + named export, props 타입은 `XxxProps`
- `any` 금지 (`unknown` 사용). 포맷은 Prettier에 맡기고 손으로 맞추지 말 것
- 새 공통 컴포넌트를 만들기 전에 `src/components/`에 비슷한 게 있는지 먼저 확인해서 재사용
- 새 패키지 설치는 사용자 확인 후, PR 설명에 이유 기록
- 요청 범위 밖의 파일(다른 팀원 담당 화면 등)은 수정하지 말 것

## Figma

- 디자인 → 코드 작업 시 Figma 링크를 받아 구현. 결과물은 위 폴더/네이밍 규칙에 맞게 재구성하고, 기존 공통 컴포넌트를 우선 사용
