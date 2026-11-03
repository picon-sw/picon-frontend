import axios from 'axios';

/**
 * 모든 서버 요청은 이 client로 보내요.
 * - 주소는 항상 '/api' 상대 경로 (서버 주소 직접 쓰지 않기)
 * - 로컬: Vite proxy → localhost:8080 / 배포: Nginx → Spring Boot
 *
 * 사용 예) const { data } = await client.get('/requests');  // → GET /api/requests
 *
 * ⚠️ S3 Pre-signed URL로 이미지 올릴 때는 이 client 말고 fetch를 써요.
 */
export const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
