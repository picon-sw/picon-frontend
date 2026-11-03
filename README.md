# picon-frontend

### 1. 브랜치 전략

| 브랜치 | 역할 | 규칙 |
| --- | --- | --- |
| main | 시연·배포용 | 직접 push 금지, develop에서 PR로만 병합 |
| develop | 개발 통합 | 직접 push 금지, feat에서 PR로만 병합 |
| type/이슈번호-내용 | 기능·작업 단위 | develop에서 만들어 작업 후 develop으로 PR |
- type/이슈번호-내용
    - type: feat, fix, refactor, docs, style, test, chore
    - 이름 규칙: 영문 소문자와 하이픈, 이슈 번호 포함
        - 예시
            - feat/12-request-create-api
            - fix/21-list-paging
- main 브랜치 보호 규칙
    - 삭제 제한
    - 병합 전 PR 필수
        - 1명 이상의 승인 필요
    - 강제 Push 차단
        - git push —forse 명령어를 통한 강제 Push를 차단

### 2. Issue 제목, PR 제목, 커밋 메시지 형식

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
