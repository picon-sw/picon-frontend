export interface UploadResult {
  // 요청서에는 파일 key만 담음 (Pre-signed URL은 저장하지 않음)
  key: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 사진 1장 업로드. onProgress에 0~1 진행률을 알려 줌
// TODO: API 나오면 이 함수 안만 교체 (지금은 예시 응답, 항상 성공)
//   1) client.post('/uploads/presigned-url', { fileName, contentType }) → { url, key }
//   2) fetch(url, { method: 'PUT', body: file }) — 원본 그대로 올림(압축 금지)
export async function uploadPhoto(
  file: File,
  onProgress: (ratio: number) => void,
): Promise<UploadResult> {
  const steps = 5;
  for (let step = 1; step <= steps; step += 1) {
    await delay(200 + Math.random() * 300);
    onProgress(step / steps);
  }
  return { key: `temp/${crypto.randomUUID()}-${file.name}` };
}
