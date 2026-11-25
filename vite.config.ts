import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      // 카카오 리다이렉트 URI가 localhost:5173으로 등록돼 있어 포트가 바뀌면 로그인이 실패함
      port: 5173,
      strictPort: true,
      // 로컬 개발 시 /api 요청을 백엔드(Spring Boot)로 전달 — 배포 환경에서는 Nginx가 담당
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});
