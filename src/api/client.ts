import axios from 'axios';

// 모든 API 요청은 이 client 사용 (baseURL: /api)
// S3 Pre-signed URL 업로드는 client 말고 fetch 사용
export const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
