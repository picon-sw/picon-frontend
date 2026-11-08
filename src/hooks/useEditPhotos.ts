import { useEffect, useRef, useState } from 'react';
import { uploadPhoto } from '../api/uploads';

export const MAX_EDIT_PHOTOS = 30;

export type UploadStatus = 'uploading' | 'done' | 'error';

export interface EditPhoto {
  id: string;
  file: File;
  // 미리보기용 브라우저 임시 주소 (업로드 주소 아님)
  previewUrl: string;
  status: UploadStatus;
  // 0~1
  progress: number;
  // 업로드가 끝나면 받는 파일 key
  key: string | null;
}

// JPG · PNG · HEIC만 (HEIC는 브라우저에 따라 type이 비어 있어 확장자로도 확인)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const ALLOWED_EXTENSION = /\.(jpe?g|png|heic|heif)$/i;

const isAllowed = (file: File) =>
  ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSION.test(file.name);

interface UseEditPhotosOptions {
  // 형식이 다르거나 장수를 넘어서 빠진 사진이 있을 때
  onReject: (message: string) => void;
}

// 편집 요청서의 보정할 사진 (최대 30장). 고르면 바로 장별로 업로드
export function useEditPhotos({ onReject }: UseEditPhotosOptions) {
  const [photos, setPhotos] = useState<EditPhoto[]>([]);
  const photosRef = useRef(photos);
  const mountedRef = useRef(true);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // 화면을 나가면 미리보기 주소 정리, 끝나지 않은 업로드 결과는 무시
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      photosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  // 업로드 중 삭제된 사진은 id가 없어서 그대로 무시됨
  const update = (id: string, patch: Partial<EditPhoto>) => {
    if (!mountedRef.current) return;
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)));
  };

  const upload = async (id: string, file: File) => {
    update(id, { status: 'uploading', progress: 0 });
    try {
      const { key } = await uploadPhoto(file, (progress) => update(id, { progress }));
      update(id, { status: 'done', progress: 1, key });
    } catch {
      update(id, { status: 'error' });
    }
  };

  const addPhotos = (files: File[]) => {
    const allowed = files.filter(isAllowed);
    const room = MAX_EDIT_PHOTOS - photos.length;
    if (allowed.length < files.length) {
      onReject('JPG, PNG, HEIC 사진만 올릴 수 있어요');
    } else if (allowed.length > room) {
      onReject(`최대 ${MAX_EDIT_PHOTOS}장까지 올릴 수 있어요`);
    }

    const added: EditPhoto[] = allowed.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      key: null,
    }));
    if (added.length === 0) return;
    setPhotos((prev) => [...prev, ...added]);
    added.forEach(({ id, file }) => void upload(id, file));
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const retryPhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) void upload(id, target.file);
  };

  return { photos, addPhotos, removePhoto, retryPhoto };
}
