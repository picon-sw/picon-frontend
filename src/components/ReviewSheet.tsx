import { useState } from 'react';
import starOffIcon from '../assets/icons/request/star-off.svg';
import starOnIcon from '../assets/icons/request/star-on.svg';
import type { Expert } from '../api/experts';
import { REVIEW_KEYWORDS, type Review, type ReviewKeyword } from '../api/proposals';
import { ActionSheet } from './ActionSheet';
import styles from './ReviewSheet.module.css';

const MAX_RATING = 5;
const MAX_LENGTH = 100;

interface ReviewSheetProps {
  expert: Expert;
  // 의뢰 제목 · 촬영일 (예: 애월 스냅 · 11월 3일 (화))
  subtitle: string;
  // 이미 남긴 후기가 있으면 보기만
  review?: Review;
  // 실패하면 throw (시트는 열린 채로 둠)
  onSubmit?: (review: Omit<Review, 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

// 후기 작성 · 보기 시트: 별점(필수) · 좋았던 점 · 한 줄 후기
export function ReviewSheet({ expert, subtitle, review, onSubmit, onClose }: ReviewSheetProps) {
  const readOnly = Boolean(review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [keywords, setKeywords] = useState<ReviewKeyword[]>(review?.keywords ?? []);
  const [content, setContent] = useState(review?.content ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleKeyword = (keyword: ReviewKeyword) => {
    setKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((item) => item !== keyword) : [...prev, keyword],
    );
  };

  const submit = async () => {
    if (!onSubmit || rating === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ rating, keywords, content: content.trim() });
    } catch {
      setError('후기를 등록하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
    }
  };

  return (
    <ActionSheet
      title={readOnly ? '내가 쓴 후기' : '후기 작성'}
      buttons={
        readOnly
          ? [{ label: '닫기', onClick: onClose }]
          : [{ label: '등록하기', onClick: submit, disabled: rating === 0 || submitting }]
      }
      onClose={onClose}
    >
      <div className={styles.expert}>
        {expert.profileImageUrl ? (
          <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
        ) : (
          <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
        )}
        <div className={styles.expertInfo}>
          <p className={styles.expertName}>{expert.name}</p>
          <p className={styles.expertText}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.stars} role="radiogroup" aria-label="별점">
        {Array.from({ length: MAX_RATING }, (_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value}점`}
              className={styles.star}
              disabled={readOnly}
              onClick={() => setRating(value)}
            >
              <img src={value <= rating ? starOnIcon : starOffIcon} alt="" />
            </button>
          );
        })}
      </div>

      <div className={styles.keywords}>
        <p className={styles.keywordsTitle}>어떤 점이 좋았나요?</p>
        <div className={styles.chips}>
          {REVIEW_KEYWORDS.map((keyword) => {
            const on = keywords.includes(keyword);
            return (
              <button
                key={keyword}
                type="button"
                aria-pressed={on}
                className={on ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                disabled={readOnly}
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </button>
            );
          })}
        </div>
      </div>

      {readOnly ? (
        content && <p className={styles.content}>{content}</p>
      ) : (
        <textarea
          className={styles.input}
          value={content}
          maxLength={MAX_LENGTH}
          placeholder="한 줄 후기를 남겨 주세요. (선택)"
          aria-label="한 줄 후기"
          onChange={(event) => setContent(event.target.value)}
        />
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </ActionSheet>
  );
}
