# syntax=docker/dockerfile:1

# 빌드 단계: 의존성 설치 후 정적 파일(dist) 생성
FROM node:26-slim AS build
WORKDIR /app
# 컨테이너 안에는 .git이 없어서 husky 설치를 건너뜀
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# 카카오 로그인 client_id (공개 식별자). .env.*는 이미지에 들어가지 않아 빌드 인자로 받음
# 예: docker build --build-arg VITE_KAKAO_CLIENT_ID=값 .
ARG VITE_KAKAO_CLIENT_ID
ENV VITE_KAKAO_CLIENT_ID=$VITE_KAKAO_CLIENT_ID
RUN npm run build

# 실행 단계: Nginx로 정적 파일 제공, /api는 백엔드로 프록시
FROM nginx:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80