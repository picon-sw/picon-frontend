import { useRef, useState } from 'react';
import type { MoodPhoto } from './useMoodPhotos';

// idle: 채우기 가능, loading: 생성 중, done: 채움 완료, error: 실패(다시 시도 가능)
export type AiFillStatus = 'idle' | 'loading' | 'done' | 'error';

interface UseAiFillOptions<T> {
  photos: MoodPhoto[];
  // 사진을 보고 채울 값을 받아 옴 (촬영 요청서 / 편집 요청서마다 다름)
  request: (photoCount: number) => Promise<T>;
  onFilled: (result: T) => void;
  onError: () => void;
}

// AI 안내 바의 채우기 상태. 채움 완료 뒤 사진이 바뀌면 다시 채우기 가능
export function useAiFill<T>({ photos, request, onFilled, onError }: UseAiFillOptions<T>) {
  const [result, setResult] = useState<{ status: AiFillStatus; photos: MoodPhoto[] | null }>({
    status: 'idle',
    photos: null,
  });
  const loadingRef = useRef(false);

  let status: AiFillStatus = 'idle';
  if (result.status === 'loading') status = 'loading';
  else if (result.photos === photos) status = result.status;

  const fill = async () => {
    // 생성 중 중복 클릭 방지
    if (loadingRef.current) return;
    loadingRef.current = true;
    const target = photos;
    setResult({ status: 'loading', photos: target });
    try {
      const value = await request(target.length);
      onFilled(value);
      setResult({ status: 'done', photos: target });
    } catch {
      setResult({ status: 'error', photos: target });
      onError();
    } finally {
      loadingRef.current = false;
    }
  };

  return { status, fill };
}
