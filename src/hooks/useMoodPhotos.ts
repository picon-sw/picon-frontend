import { useEffect, useRef, useState } from 'react';

export const MAX_MOOD_PHOTOS = 3;

export interface MoodPhoto {
  id: string;
  file: File;
  // 미리보기용 브라우저 임시 주소 (업로드 주소 아님)
  previewUrl: string;
}

// 요청서의 원하는 분위기 사진 (최대 3장). 촬영 · 편집 요청서가 함께 사용
// TODO: 업로드 API 연동 시 Pre-signed URL로 PUT 후 파일 key만 요청서에 담기
export function useMoodPhotos() {
  const [photos, setPhotos] = useState<MoodPhoto[]>([]);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // 화면을 나가면 미리보기 주소 정리
  useEffect(() => {
    return () => photosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
  }, []);

  // 남은 칸만큼만 추가 (올린 순서대로)
  const addPhotos = (files: File[]) => {
    const room = MAX_MOOD_PHOTOS - photos.length;
    const added = files.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    if (added.length > 0) setPhotos([...photos, ...added]);
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  return { photos, addPhotos, removePhoto };
}
