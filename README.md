# picon-frontend

PIC:ON 프론트엔드 저장소입니다.

설치 방법, 폴더 구조, 라이브러리 사용법 등은 팀 노션의 **프론트엔드 개발 가이드** 페이지를 참고해주세요.

## 브랜치

| 브랜치 | 역할 | 규칙 |
| --- | --- | --- |
| main | 시연·배포용 | 직접 push 금지, develop에서 PR로만 병합 |
| develop | 개발 통합 | 직접 push 금지, feat에서 PR로만 병합 |
| type/이슈번호-내용 | 기능·작업 단위 | develop에서 만들어 작업 후 develop으로 PR |
- type/이슈번호-내용
    - type: feat, fix, refactor, docs, chore
    - 이름 규칙: 영문 소문자와 하이픈, 이슈 번호 포함
        - 예시
            - feat/12-request-create-api
            - fix/21-list-paging
- main 브랜치 보호 규칙
    - 삭제 제한
    - 병합 전 PR 필수
        - 1명 이상의 승인 필요
    - 강제 Push 차단
        - git push --force 명령어를 통한 강제 Push를 차단

## Issue 제목, PR 제목, 커밋 메시지

| type | 용도 |
| --- | --- |
| feat | 새 기능 |
| fix | 버그 수정 |
| refactor | 동작 변화 없는 코드 정리 |
| docs | 문서 수정 |
| chore | 설정, 의존성, 빌드, 배포 설정. |
- **예시**
    - feat: 의뢰 등록 API 추가
    - fix: 의뢰 목록 조회 시 페이지 번호 오류 수정

## PR

- PR은 `develop`으로 보내고, 1명 이상 승인 + CI 통과 후 Squash and merge
- 한 PR에는 한 기능만
- UI 변경 시 스크린샷 첨부
- merge 후 작업 브랜치 삭제

## 코드

- 화면은 `src/pages/XxxPage.tsx`, 라우트는 `src/App.tsx`에 추가
- 여러 화면에서 쓰는 컴포넌트는 `src/components/`
- 컴포넌트는 `function` 선언 + named export, props 타입은 `XxxProps`
- `any` 사용 금지
- 파일명: 컴포넌트 `PascalCase.tsx`, 훅 `useXxx.ts`, 그 외 `camelCase.ts`
- 코드 포맷은 Prettier·ESLint가 저장/커밋 시 자동 적용
- PR 전에 `npm run lint`, `npm run build` 확인
- 새 라이브러리 설치 시 PR에 이유 작성

## API · 보안

- API는 `src/api/client.ts`로 `/api` 상대 경로 호출 (서버 주소 직접 작성 금지)
- Secret, API Key, 토큰은 프론트 코드와 `.env`에 넣지 않음
- 이미지는 백엔드에서 받은 Pre-signed URL로 업로드·조회
- 카카오 로그인 토큰 교환은 백엔드에서 처리, 토큰을 localStorage에 저장하지 않음
- LLM 기능은 `/api`를 통해서만 호출
