// TODO: API 나오면 client.post('/requests/draft-note', ...)로 교체 (임시 응답)
// 분위기 사진을 보고 요청 사항 문장을 만들어 줌 (shoot: 촬영 요청서, edit: 편집 요청서)
export type DraftNoteKind = 'shoot' | 'edit';

export async function fetchDraftNote(
  photoCount: number,
  kind: DraftNoteKind = 'shoot',
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (kind === 'edit') {
    return `참고 사진 ${photoCount}장처럼 따뜻하고 부드러운 색감으로 맞춰 주세요. 피부는 자연스럽게 정리하고, 과한 보정 없이 원본 느낌을 살려 주세요.`;
  }
  return `참고 사진 ${photoCount}장처럼 자연광 아래에서 따뜻하고 부드러운 색감으로 찍고 싶어요. 자연스럽게 웃는 순간을 많이 담아 주세요.`;
}
