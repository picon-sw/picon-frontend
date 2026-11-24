// 마지막 글자에 받침이 있는지 (한글이 아니면 받침 없음으로 봄)
function hasFinalConsonant(word: string): boolean {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

// 이/가 (예: 서하 작가가, 무드필름이)
export function withSubject(word: string): string {
  return `${word}${hasFinalConsonant(word) ? '이' : '가'}`;
}

// 은/는 (예: 서하 작가는, 무드필름은)
export function withTopic(word: string): string {
  return `${word}${hasFinalConsonant(word) ? '은' : '는'}`;
}
