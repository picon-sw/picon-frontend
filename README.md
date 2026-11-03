# picon-frontend

**PIC:ON** — 나만의 순간을 더 특별하게 📸
졸업·커플·여행·프로필 사진을 신진 사진가와 연결해주는 사진 촬영 매칭 플랫폼의 프론트엔드입니다.

---

## 📌 꼭 지켜야 할 규칙 (먼저 읽어주세요)

| #   | 규칙                                                                                 |
| --- | ------------------------------------------------------------------------------------ |
| 1   | `main`, `develop`에 **직접 push 금지**. 항상 브랜치 만들어서 `develop`으로 PR        |
| 2   | 브랜치 이름: `type/이슈번호-내용` → `feat/12-login-page`                             |
| 3   | 커밋 · PR 제목 · 이슈 제목: `type: 한글 설명` → `feat: 로그인 화면 추가`             |
| 4   | PR은 **1명 이상 승인** + 자동 검사(CI) 통과 후 **Squash and merge**                  |
| 5   | API는 서버 주소 말고 **`/api`로 시작하는 상대 경로**로 호출                          |
| 6   | 비밀값(Secret, API Key, 토큰)은 **프론트 코드·`.env`에 절대 넣지 않기**              |
| 7   | 코드 모양(띄어쓰기, 따옴표 등)은 신경 쓰지 않기 — **저장·커밋할 때 자동으로 정리됨** |

> 규칙을 바꾸고 싶으면 이 README를 수정하는 PR을 올리고 팀원 모두 합의하면 돼요.

---

## 🚀 처음 시작하기

준비물: **Node.js 26**, VS Code

```bash
git clone https://github.com/picon-sw/picon-frontend.git
cd picon-frontend
npm ci          # 라이브러리 설치 (커밋 자동 검사도 같이 설치돼요)
npm run dev     # 개발 서버 실행 → http://localhost:5173
```

- VS Code로 폴더를 열면 오른쪽 아래에 **"권장 확장 설치"** 알림이 떠요 → 설치하면 저장할 때마다 코드가 자동 정리돼요.
- 로컬에서 백엔드(Spring Boot, 8080)를 같이 켜두면 `/api` 요청이 자동으로 백엔드로 가요.

### 자주 쓰는 명령어

| 명령어             | 하는 일                                     |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | 개발 서버 실행                              |
| `npm run build`    | 배포용 빌드 (결과: `dist/`) — PR 전에 한 번 |
| `npm run lint`     | 코드 문제 검사                              |
| `npm run lint:fix` | 고칠 수 있는 문제 자동 수정                 |
| `npm run format`   | 전체 코드 모양 정리                         |

---

## 🔁 작업 순서

```bash
# 1. 최신 develop에서 내 브랜치 만들기
git switch develop
git pull
git switch -c feat/12-login-page

# 2. 작업하고 커밋 (커밋할 때 검사가 자동으로 돌아요)
git add .
git commit -m "feat: 로그인 화면 추가"

# 3. 올리고 GitHub에서 develop으로 PR 만들기
git push -u origin feat/12-login-page
```

### 브랜치

| 브랜치               | 역할           | 규칙                                          |
| -------------------- | -------------- | --------------------------------------------- |
| `main`               | 시연·배포용    | 직접 push 금지, `develop`에서 PR로만 병합     |
| `develop`            | 개발 통합      | 직접 push 금지, 작업 브랜치에서 PR로만 병합   |
| `type/이슈번호-내용` | 기능·작업 단위 | `develop`에서 만들어 작업 후 `develop`으로 PR |

- 이름은 **영문 소문자와 하이픈**, 이슈 번호 포함 (`#` 없이) → `feat/12-login-page`, `fix/21-list-paging`
- merge된 브랜치는 삭제해요.
- `main`은 삭제 제한 · PR 필수(승인 1명) · 강제 push 차단이 걸려 있어요.

### type 종류 (브랜치 · 커밋 · PR · 이슈 공통)

| type       | 용도                             | 예시                                           |
| ---------- | -------------------------------- | ---------------------------------------------- |
| `feat`     | 새 기능                          | `feat: 의뢰 등록 화면 추가`                    |
| `fix`      | 버그 수정                        | `fix: 의뢰 목록 조회 시 페이지 번호 오류 수정` |
| `refactor` | 동작 변화 없는 코드 정리         | `refactor: 로그인 로직 훅으로 분리`            |
| `style`    | CSS·디자인 수정 (로직 변화 없음) | `style: 버튼 여백 조정`                        |
| `docs`     | 문서 수정                        | `docs: README 규칙 추가`                       |
| `test`     | 테스트 추가·수정                 | `test: 날짜 포맷 함수 테스트 추가`             |
| `chore`    | 설정, 의존성, 빌드, 배포 설정    | `chore: axios 설치`                            |

### Pull Request

1. **작게** 나눠요. 한 PR에 한 기능 (가능하면 300줄 이하).
2. PR 템플릿을 채워요. 본문에 `close #이슈번호`를 쓰면 merge 때 이슈가 자동으로 닫혀요. 화면 변경이면 스크린샷 첨부.
3. 리뷰는 **24시간 안에**. 바로 못 보면 "내일 볼게요" 코멘트라도 남겨요.
4. 리뷰 코멘트 말머리: `[필수]` 고쳐야 merge 가능 / `[제안]` 작성자 판단 / `[질문]` 궁금한 것
5. 승인 + CI 통과 → 작성자가 **Squash and merge**. (PR 제목이 최종 커밋 메시지가 돼요)

---

## 📁 파일 구조

**코드는 `src/` 안에서만 작성해요.** 나머지 파일은 대부분 도구 설정이라 몰라도 괜찮아요.

```
picon-frontend/
├─ src/                  ⭐ 우리가 코드를 쓰는 곳
│  ├─ main.tsx           앱 시작점 (거의 안 건드림)
│  ├─ App.tsx            주소(URL) ↔ 화면 연결 — 새 화면 만들면 여기에 추가
│  ├─ index.css          앱 전체 기본 스타일
│  ├─ pages/             화면 하나하나 (HomePage, LoginPage…)
│  └─ api/               서버 요청 (client.ts를 통해서만)
│
├─ public/               그대로 배포되는 파일 (파비콘 등)
├─ index.html            브라우저가 처음 여는 HTML (React가 이 안에 그려짐)
├─ package.json          라이브러리 목록 + 명령어 + 코드 정리 규칙
├─ package-lock.json     라이브러리 정확한 버전 기록 (항상 같이 커밋)
├─ README.md             지금 보고 있는 문서
├─ CLAUDE.md             Claude Code가 자동으로 읽는 AI용 규칙
│
├─ vite.config.ts        개발 서버·빌드 설정 (/api → 백엔드 연결)
├─ tsconfig*.json        TypeScript 설정 (3개 모두 Vite 기본 구성)
├─ eslint.config.js      코드 검사 규칙
├─ .github/              PR·이슈 템플릿, 자동 검사(CI)
├─ .husky/               커밋할 때 자동 검사
├─ .vscode/              저장할 때 자동 정리, 권장 확장
└─ .gitignore            git에 올리지 않을 파일 목록
```

> `node_modules/`(설치된 라이브러리)와 `dist/`(빌드 결과)는 자동으로 생기는 폴더라 신경 쓰지 않아도 돼요.

### 폴더가 더 필요해지면

지금은 기본 폴더만 있어요. 필요할 때 아래 이름으로 `src/` 안에 만들어요.

| 폴더          | 용도                                        |
| ------------- | ------------------------------------------- |
| `components/` | 여러 화면에서 같이 쓰는 UI (Button, Modal…) |
| `hooks/`      | 커스텀 훅 (`useAuth`…)                      |
| `types/`      | 공통 타입                                   |
| `utils/`      | 도우미 함수 (`formatDate`…)                 |
| `assets/`     | 코드에서 불러 쓰는 이미지·아이콘            |

### 이름 짓기

| 대상     | 규칙                  | 예시            |
| -------- | --------------------- | --------------- |
| 컴포넌트 | `PascalCase.tsx`      | `PhotoCard.tsx` |
| 화면     | `PascalCase` + `Page` | `LoginPage.tsx` |
| 훅       | `use` + `camelCase`   | `useAuth.ts`    |
| 그 외    | `camelCase.ts`        | `formatDate.ts` |
| 상수     | `UPPER_SNAKE_CASE`    | `MAX_FILE_SIZE` |

### 컴포넌트 작성 방식

```tsx
type PhotoCardProps = {
  title: string;
  onClick?: () => void;
};

export function PhotoCard({ title, onClick }: PhotoCardProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

- `function` 선언 + `export` (default export X), props 타입 이름은 `컴포넌트이름Props`
- `any` 쓰지 않기 (모르겠으면 `unknown`)
- 너무 길어지면(약 150줄 이상) 쪼개기
- 새 공통 컴포넌트를 만들기 전에 이미 있는지 먼저 확인!

---

## 🔌 서버 · 인프라와 약속한 것

### API 호출

```ts
import { client } from '../api/client';

const { data } = await client.get('/requests'); // ✅ → GET /api/requests
fetch('http://localhost:8080/api/requests'); // ❌ 서버 주소 직접 쓰지 않기
```

배포 환경에서는 Nginx가, 로컬에서는 Vite가 `/api`를 Spring Boot(8080)로 넘겨줘요.
백엔드 주소가 다르면 `.env.local` 파일에 `VITE_API_PROXY_TARGET=http://주소:포트`를 적어요. (git에 안 올라가요)

### 비밀값

빌드 결과는 브라우저에 그대로 공개돼요. **`VITE_`로 시작하는 환경 변수도 누구나 볼 수 있어요.**
Secret, API Key, 토큰이 필요한 일은 전부 백엔드가 해요.

### 이미지 (S3는 비공개)

- **올리기**: 백엔드에 Pre-signed URL 요청 → 그 URL로 브라우저가 S3에 직접 `PUT` (이때는 `client` 말고 `fetch`) → 백엔드에 파일 key 전달
- **보기**: API가 준 Pre-signed URL을 `<img src>`에 그대로 사용. **시간이 지나면 만료**되니 오래 저장하지 않기

### 카카오 로그인 · LLM

- 카카오 Secret과 토큰 교환은 **백엔드 담당**. 프론트는 카카오 로그인 화면으로 보내고, 콜백 화면(`/oauth/kakao/callback`)에서 받은 `code`를 `/api`로 넘겨요. 토큰을 localStorage에 저장하지 않아요.
- 리뷰 요약·챗봇(LLM)은 **반드시 `/api`를 거쳐서** 호출해요.

---

## 🧰 기술 스택

우리 프론트는 Nginx가 파일만 보내주는 **정적 SPA**라서 서버가 필요한 Next.js 대신 Vite를 써요.

| 영역           | 사용                                 | 상태           |
| -------------- | ------------------------------------ | -------------- |
| 기본           | React 19 + TypeScript + Vite         | ✅             |
| 화면 이동      | React Router                         | ✅             |
| 서버 데이터    | TanStack Query                       | ✅             |
| 서버 요청      | axios (`src/api/client.ts`)          | ✅             |
| 코드 정리·검사 | Prettier, ESLint, husky, lint-staged | ✅             |
| 앱처럼 설치    | PWA (vite-plugin-pwa)                | 예정           |
| 스타일링       | 후보: Tailwind CSS / CSS Modules     | ⏳ 팀 합의     |
| 전역 상태      | 후보: Zustand                        | ⏳ 팀 합의     |
| 로그인 방식    | 카카오 OAuth (쿠키 방식 권장)        | 🤝 백엔드 협의 |
| 챗봇 응답      | 일반 요청 or 스트리밍(SSE)           | 🤝 백엔드 협의 |

> ⚠️ TypeScript는 `~6.0.0`으로 고정이에요. (typescript-eslint 호환 문제로 올리지 마세요)
> 새 라이브러리를 설치할 때는 PR 설명에 이유를 적어요.

---

## 🤖 AI(Claude 등)로 작업할 때

- Claude Code는 `CLAUDE.md`를 자동으로 읽어서 이 규칙대로 작업해요.
- 다른 AI 도구라면 이 README를 먼저 읽게 해주세요.
- AI가 만든 코드도 **내가 이해한 것만** PR로 올려요. 리뷰 기준은 똑같아요.

---

<details>
<summary>📦 배포 / 인프라 참고 (인프라 담당용)</summary>

| 항목           | 값                                                                                    |
| -------------- | ------------------------------------------------------------------------------------- |
| 빌드 명령      | `npm ci && npm run build`                                                             |
| 빌드 결과 폴더 | `dist/` (Nginx에 복사)                                                                |
| Node 버전      | 26 (`package.json` engines)                                                           |
| 라우팅         | SPA (React Router) → Nginx에 `try_files $uri $uri/ /index.html;` 필요                 |
| API 호출       | `/api` 상대 경로 → Nginx가 Spring Boot(8080)로 프록시                                 |
| 비밀값         | 프론트 코드·빌드 환경 변수에 넣지 않음 (백엔드에서만 관리)                            |
| 이미지 업로드  | 백엔드 발급 Pre-signed URL로 브라우저가 S3에 직접 `PUT` (도메인 확정 후 S3 CORS 등록) |
| 이미지 조회    | API 응답의 Pre-signed URL 사용 (S3 퍼블릭 차단 유지)                                  |
| 카카오 로그인  | 콜백 경로 `/oauth/kakao/callback` → 카카오 Redirect URI 등록 필요                     |
| 챗봇 (협의 중) | SSE 스트리밍 사용 시 해당 `/api` 경로에 `proxy_buffering off;` 필요                   |

</details>
