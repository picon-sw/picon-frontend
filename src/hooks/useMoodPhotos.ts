import { useState } from 'react';

// 참고 사진은 지금 1장 (나중에 늘릴 수 있게 상수로 둠)
export const MAX_MOOD_PHOTOS = 1;

export interface MoodPhoto {
  id: string;
  file: File;
  // 미리보기용 브라우저 임시 주소 (업로드 주소 아님)
  previewUrl: string;
}

// 파일마다 미리보기 주소를 한 번만 만들어 재사용
// 요청서를 나갔다가 돌아왔을 때(같은 파일) 같은 주소를 다시 쓰려고 화면을 나갈 때는 지우지 않고,
// 사진을 삭제할 때만 지움 (참고 사진은 1장이라 남는 주소가 거의 없음)
const previewUrls = new WeakMap<File, string>();

function previewUrlOf(file: File): string {
  let url = previewUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrls.set(file, url);
  }
  return url;
}

function toPhoto(file: File): MoodPhoto {
  return { id: crypto.randomUUID(), file, previewUrl: previewUrlOf(file) };
}

// 요청서의 참고 사진 (최대 MAX_MOOD_PHOTOS장). 촬영 · 편집 요청서가 함께 사용
// TODO: 업로드 API 연동 시 Pre-signed URL로 PUT 후 파일 key만 요청서에 담기
// initialFiles: 다른 화면에 갔다가 돌아왔을 때 다시 채울 파일
export function useMoodPhotos(initialFiles: File[] = []) {
  const [photos, setPhotos] = useState<MoodPhoto[]>(() =>
    initialFiles.slice(0, MAX_MOOD_PHOTOS).map(toPhoto),
  );

  // 남은 칸만큼만 추가 (올린 순서대로)
  const addPhotos = (files: File[]) => {
    const room = MAX_MOOD_PHOTOS - photos.length;
    const added = files.slice(0, room).map(toPhoto);
    if (added.length > 0) setPhotos([...photos, ...added]);
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      previewUrls.delete(target.file);
    }
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  return { photos, addPhotos, removePhoto };
}
