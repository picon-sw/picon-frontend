import { useRef, useState } from 'react';
import { fetchDraftNote, type DraftNoteKind } from '../api/requests';
import type { MoodPhoto } from './useMoodPhotos';

// idle: 채우기 가능, loading: 생성 중, done: 채움 완료, error: 실패(다시 시도 가능)
export type AiFillStatus = 'idle' | 'loading' | 'done' | 'error';

interface UseAiFillOptions {
  photos: MoodPhoto[];
  // 요청서 종류에 맞는 문장을 만듦 (기본: 촬영)
  kind?: DraftNoteKind;
  onFilled: (text: string) => void;
  onError: () => void;
}

// AI 안내 바의 채우기 상태. 채움 완료 뒤 사진이 바뀌면 다시 채우기 가능
export function useAiFill({ photos, kind = 'shoot', onFilled, onError }: UseAiFillOptions) {
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
      const text = await fetchDraftNote(target.length, kind);
      onFilled(text);
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
