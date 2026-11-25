import { useState } from 'react';
import { ActionSheet } from './ActionSheet';
import styles from './InquirySheet.module.css';

const INQUIRY_MAX_LENGTH = 300;

interface InquirySheetProps {
  expertName: string;
  // 설명 둘째 줄 (예: 답변이 오면 알림으로 알려 드려요.)
  answerGuide: string;
  // 보내기에 실패하면 throw (시트는 열린 채로 둠)
  onSubmit: (content: string) => Promise<void>;
  onClose: () => void;
}

// 작가에게 문의하기 시트 (300자)
export function InquirySheet({ expertName, answerGuide, onSubmit, onClose }: InquirySheetProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch {
      setError('문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSending(false);
    }
  };

  return (
    <ActionSheet
      title="작가에게 문의하기"
      description={`${expertName}에게 궁금한 점을 남겨 주세요.\n${answerGuide}`}
      buttons={[
        { label: '문의 보내기', onClick: submit, disabled: content.trim().length === 0 || sending },
      ]}
      onClose={onClose}
    >
      <label className={styles.field}>
        <span className={styles.label}>문의 내용</span>
        <textarea
          className={styles.textarea}
          value={content}
          maxLength={INQUIRY_MAX_LENGTH}
          placeholder="촬영 장소, 준비물 등 궁금한 점을 적어 주세요"
          onChange={(event) => setContent(event.target.value)}
        />
        <span className={styles.counter}>
          {content.length}/{INQUIRY_MAX_LENGTH}
        </span>
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </label>
    </ActionSheet>
  );
}
