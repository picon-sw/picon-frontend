# 협업 규칙 (Contributing Guide)

PIC:ON 프론트엔드 팀(3명)의 작업 규칙입니다.
**직접 작업하든 Claude 같은 AI로 작업하든 똑같이 적용됩니다.**
브랜치·커밋 규칙은 백엔드/인프라와 같은 **팀 공통 규칙**이에요.

> 바쁘면 [⚡ 한눈에 보기](#-한눈에-보기)만 읽어도 충분해요.

---

## ⚡ 한눈에 보기

```bash
# 1. 최신 develop에서 브랜치 만들기
git switch develop && git pull
git switch -c feat/12-login-page

# 2. 작업 + 커밋 (커밋할 때 lint/format 자동 실행)
git commit -m "feat: 로그인 페이지 UI 추가"

# 3. push 후 develop으로 PR → 리뷰 1명 승인 → Squash and merge
git push -u origin feat/12-login-page
```

| 항목              | 규칙                                                      |
| ----------------- | --------------------------------------------------------- |
| 브랜치            | `type/이슈번호-내용` 예) `feat/12-login-page`             |
| 커밋·PR·이슈 제목 | `type: 한글 설명` 예) `fix: 헤더 깨짐 수정`               |
| PR 대상           | 항상 `develop` (`main`은 develop에서 PR로만)              |
| merge 조건        | 리뷰 승인 1명 + CI 통과 → **Squash and merge**            |
| API 호출          | 서버 주소 X, **`/api` 상대 경로**로                       |
| 비밀값            | 프론트 코드·`.env`에 **절대 넣지 않기**                   |
| 코드 스타일       | 신경 쓰지 말 것. 저장/커밋 시 Prettier·ESLint가 자동 처리 |

---

## 1. 처음 세팅

```bash
git clone https://github.com/picon-sw/picon-frontend.git
cd picon-frontend
nvm use            # .nvmrc의 Node 버전 사용 (nvm 없으면 Node 26 설치)
npm ci             # package-lock.json 그대로 설치 + husky(커밋 훅) 설치
npm run dev        # http://localhost:5173
```

- 패키지 설치는 `npm ci`를 기본으로 써요. 새 패키지를 추가할 때만 `npm install 패키지명`.
- `package-lock.json`은 **항상 커밋**해요. (빌드 서버도 `npm ci`로 똑같이 설치해요)
- **VS Code 사용 시** 프로젝트를 열면 뜨는 "권장 확장 설치"를 눌러주세요.
  (ESLint, Prettier, EditorConfig) → 저장할 때마다 자동으로 포맷돼요.

## 2. 브랜치 전략

| 브랜치               | 역할           | 규칙                                          |
| -------------------- | -------------- | --------------------------------------------- |
| `main`               | 시연·배포용    | 직접 push 금지, `develop`에서 PR로만 병합     |
| `develop`            | 개발 통합      | 직접 push 금지, 작업 브랜치에서 PR로만 병합   |
| `type/이슈번호-내용` | 기능·작업 단위 | `develop`에서 만들어 작업 후 `develop`으로 PR |

- **type**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
- **이름 규칙**: 영문 소문자와 하이픈, 이슈 번호 포함 (`#` 없이)
  - `feat/12-login-page`
  - `fix/21-list-paging`
- 작업 브랜치는 **항상 최신 `develop`에서** 만들고, merge되면 삭제해요.

**`main` 브랜치 보호 규칙** (GitHub 설정으로 강제)

- 브랜치 삭제 제한
- 병합 전 PR 필수 — 1명 이상의 승인 필요
- 강제 push(`git push --force`) 차단

## 3. Issue 제목, PR 제목, 커밋 메시지 형식

셋 다 같은 형식이에요.

```
type: 무엇을 했는지 한글로
```

| type       | 용도                             |
| ---------- | -------------------------------- |
| `feat`     | 새 기능                          |
| `fix`      | 버그 수정                        |
| `refactor` | 동작 변화 없는 코드 정리         |
| `docs`     | 문서 수정                        |
| `style`    | CSS·디자인 수정 (로직 변화 없음) |
| `test`     | 테스트 추가·수정                 |
| `chore`    | 설정, 의존성, 빌드, 배포 설정    |

예시

- `feat: 의뢰 등록 화면 추가`
- `fix: 의뢰 목록 조회 시 페이지 번호 오류 수정`

> Squash merge를 쓰니까 작업 중 커밋은 조금 지저분해도 괜찮아요.
> **PR 제목**만 규칙을 꼭 지켜주세요. (PR 제목이 develop에 남는 최종 커밋 메시지가 돼요)

## 4. Pull Request

1. **작게** 나눠요. 가능하면 300줄 이하, 한 기능 단위.
2. PR 템플릿을 채워요. 본문에 `close #이슈번호`를 쓰면 merge 시 이슈가 자동으로 닫혀요. UI 변경이면 스크린샷 필수.
3. 리뷰어는 나머지 2명 중 1명 이상 지정.
4. **리뷰는 24시간 안에.** 바로 못 보면 코멘트로 "내일 볼게요"라도 남겨요.
5. 승인 + CI 통과 → 작성자가 직접 **Squash and merge**.

리뷰할 때 코멘트 앞에 붙이면 좋은 말머리:

- `[필수]` 고쳐야 merge 가능
- `[제안]` 고치면 좋지만 작성자 판단
- `[질문]` 궁금해서 묻는 것

## 5. API 호출 · 비밀값 · 이미지 업로드 (인프라 합의 사항)

### API는 `/api` 상대 경로로

```ts
// ✅ 이렇게
fetch('/api/requests');

// ❌ 서버 주소 직접 쓰지 않기
fetch('http://localhost:8080/api/requests');
fetch('https://api.picon.com/requests');
```

- 배포 환경에서는 Nginx가 `/api`를 Spring Boot(8080)로 넘겨줘요. → 화면과 API가 한 도메인이 되고 CORS 문제도 없어요.
- 로컬 개발(`npm run dev`)에서는 Vite가 `/api`를 `http://localhost:8080`으로 넘겨줘요. (`vite.config.ts`의 proxy)
  - 백엔드 주소가 다르면 `.env.local`에 `VITE_API_PROXY_TARGET=http://주소:포트` (이 파일은 git에 안 올라가요)

### 비밀값은 프론트에 넣지 않기

- Secret, API Key, 토큰 등은 **프론트 코드와 빌드 환경 변수(`.env`)에 절대 넣지 않아요.**
- 빌드 결과는 브라우저에 그대로 공개돼요. `VITE_`로 시작하는 환경 변수도 누구나 볼 수 있어요.
- 비밀값이 필요한 기능은 백엔드 API를 거쳐서 처리해요.

### 이미지 업로드 흐름

1. 프론트 → 백엔드: 업로드용 **Pre-signed URL** 요청
2. 브라우저 → S3: 받은 URL로 이미지 파일을 직접 `PUT`
3. 프론트 → 백엔드: 업로드된 파일 정보 전달

> S3 CORS에 서비스 도메인을 등록해야 하므로, 도메인 확정 후 인프라에 전달해요.

## 6. 코드 스타일

사람이 외울 필요 없게 도구가 처리해요.

| 도구                | 역할                        | 언제 실행                       |
| ------------------- | --------------------------- | ------------------------------- |
| Prettier            | 줄바꿈·따옴표·세미콜론 통일 | 저장할 때, 커밋할 때            |
| ESLint              | 버그 가능성 있는 코드 경고  | 저장할 때, 커밋할 때            |
| husky + lint-staged | 커밋 전 위 두 개 자동 실행  | `git commit` 할 때              |
| GitHub Actions      | lint·format·build 검사      | PR 올릴 때 (실패 시 merge 불가) |

자주 쓰는 명령어:

```bash
npm run dev           # 개발 서버
npm run lint          # 린트 검사
npm run lint:fix      # 린트 자동 수정
npm run format        # 전체 포맷
npm run build         # 타입 체크 + 빌드 → dist/ (PR 전에 한 번)
```

## 7. 폴더 구조와 이름 짓기

```
src/
├─ components/   공통 UI 컴포넌트 (Button, Modal, Header…)
├─ pages/        화면 단위 컴포넌트 (LoginPage, HomePage…)
├─ hooks/        커스텀 훅 (useAuth, useDebounce…)
├─ api/          서버 통신 함수 (모두 /api 상대 경로)
├─ stores/       전역 상태
├─ types/        공통 타입
├─ utils/        순수 함수 유틸 (formatDate…)
└─ assets/       이미지, 폰트, 아이콘
```

| 대상       | 규칙                   | 예시                    |
| ---------- | ---------------------- | ----------------------- |
| 컴포넌트   | `PascalCase.tsx`       | `PhotoCard.tsx`         |
| 페이지     | `PascalCase` + `Page`  | `LoginPage.tsx`         |
| 훅         | `use` + `camelCase.ts` | `useAuth.ts`            |
| 그 외 파일 | `camelCase.ts`         | `formatDate.ts`         |
| 타입       | `PascalCase`           | `type Photographer = …` |
| 상수       | `UPPER_SNAKE_CASE`     | `MAX_UPLOAD_SIZE`       |

컴포넌트 작성 방식:

```tsx
// ✅ function 선언 + named export, props 타입은 컴포넌트 이름 + Props
type PhotoCardProps = {
  title: string;
  onClick?: () => void;
};

export function PhotoCard({ title, onClick }: PhotoCardProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

- `any` 쓰지 않기. 모르겠으면 `unknown`.
- 한 컴포넌트가 너무 길어지면(약 150줄 이상) 쪼개기.
- 2곳 이상에서 쓰면 `components/`로, 한 페이지에서만 쓰면 해당 페이지 옆에 둬요.

## 8. 작업 나누기

- 모든 작업은 **GitHub Issue**로 만들고 담당자를 지정해요. (Projects 보드로 진행 상황 공유)
- **공통 컴포넌트**(Button, Input 등)는 한 명이 먼저 만들고 나머지가 가져다 써요. 같은 걸 두 번 만들지 않도록 이슈를 먼저 확인!
- 화면/기능 단위로 담당을 나누면 충돌이 적어요.
- 패키지를 새로 설치할 때는 PR 설명에 이유를 적어요.

## 9. 기술 스택

| 영역      | 선택                                  | 상태    |
| --------- | ------------------------------------- | ------- |
| 빌드      | Vite + React + TypeScript (→ `dist/`) | ✅ 확정 |
| Node      | 26 (`.nvmrc`, `package.json` engines) | ✅ 확정 |
| 라우팅    | React Router (SPA)                    | 예정    |
| 서버 상태 | TanStack Query                        | 예정    |
| 스타일링  | (팀 합의 필요)                        | ⏳ 미정 |
| 전역 상태 | (팀 합의 필요)                        | ⏳ 미정 |

> ⚠️ TypeScript는 `~6.0.0`으로 고정이에요. typescript-eslint 호환 문제로 올리지 마세요.

## 10. AI(Claude 등)로 작업할 때

- 이 프로젝트의 [`CLAUDE.md`](./CLAUDE.md)를 Claude Code가 자동으로 읽어요. 따로 규칙을 설명할 필요 없어요.
- 다른 AI 도구를 쓰면 이 문서(`CONTRIBUTING.md`)를 먼저 읽게 해주세요.
- AI가 만든 코드도 **내가 이해하고 확인한 것만** PR로 올려요. 리뷰 기준은 똑같아요.
- AI가 `main`/`develop`에 직접 push하거나 merge하지 않도록 해주세요.

---

규칙을 바꾸고 싶으면 이 문서를 수정하는 PR을 올리고 3명이 합의하면 돼요.
