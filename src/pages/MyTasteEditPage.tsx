import { useState } from 'react';
import { useNavigate } from 'react-router';
import { type InterestField, useMyTaste } from '../hooks/useMyTaste';
import { PageHeader } from '../components/PageHeader';
import styles from './MyTasteEditPage.module.css';

interface TagGroup {
  title: string;
  // 이 그룹이 보이는 관심 분야
  fields: InterestField[];
  tags: string[];
}

const INTEREST_FIELDS: InterestField[] = ['촬영', '촬영 및 편집', '편집'];
const MAX_TAGS = 5;

// 탐색 해시태그 · 온보딩 사진 스타일과 겹치게 구성
const TAG_GROUPS: TagGroup[] = [
  {
    title: '사진 분위기',
    fields: ['촬영', '촬영 및 편집', '편집'],
    tags: ['자연광', '인물', '풍경', '필름', '감성', '흑백', '빈티지', '컨셉'],
  },
  {
    title: '촬영 종류',
    fields: ['촬영', '촬영 및 편집'],
    tags: [
      '프로필',
      '졸업사진',
      '웨딩',
      '커플사진',
      '우정사진',
      '가족사진',
      '반려동물',
      '스냅',
      '바디프로필',
    ],
  },
  {
    title: '편집 종류',
    fields: ['편집', '촬영 및 편집'],
    tags: ['색보정', '피부보정', '배경 합성', '필름 톤', '흑백 변환', '리터칭'],
  },
];

// 관심 분야에 맞는 태그 그룹만
function groupsFor(field: InterestField) {
  return TAG_GROUPS.filter(({ fields }) => fields.includes(field));
}

export function MyTasteEditPage() {
  const navigate = useNavigate();
  // 지금 저장된 취향을 처음 값으로 → 저장하면 마이페이지에도 반영
  const { taste, saveTaste } = useMyTaste();
  const [field, setField] = useState<InterestField>(taste.field);
  const [tags, setTags] = useState<string[]>(taste.tags);

  const visibleGroups = groupsFor(field);

  const changeField = (next: InterestField) => {
    setField(next);
    // 바뀐 분야에서 보이지 않는 태그는 선택 해제
    const available = groupsFor(next).flatMap((group) => group.tags);
    setTags((prev) => prev.filter((tag) => available.includes(tag)));
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((item) => item !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  };

  const changed =
    field !== taste.field ||
    tags.length !== taste.tags.length ||
    tags.some((tag) => !taste.tags.includes(tag));
  const canSave = tags.length > 0 && changed;

  const save = () => {
    if (!canSave) return;
    saveTaste({ field, tags });
    navigate('/my');
  };

  return (
    <main className={styles.page}>
      <PageHeader title="내 취향 설정" backTo="/my" />

      <p className={styles.description}>고른 취향에 맞춰 전문가와 콘텐츠를 추천해 드려요.</p>

      <section aria-labelledby="field-title">
        <h2 id="field-title" className={styles.sectionTitle}>
          관심 분야
        </h2>
        <div className={styles.fields} role="radiogroup" aria-labelledby="field-title">
          {INTEREST_FIELDS.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={field === item}
              className={field === item ? `${styles.field} ${styles.fieldActive}` : styles.field}
              onClick={() => changeField(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="tags-title">
        <div className={styles.tagsHeader}>
          <h2 id="tags-title" className={styles.sectionTitle}>
            취향 태그
          </h2>
          <span className={styles.count} aria-live="polite">
            {tags.length}/{MAX_TAGS}
          </span>
        </div>
        <p className={styles.hint}>최대 {MAX_TAGS}개까지 고를 수 있어요.</p>

        {visibleGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <ul className={styles.tags}>
              {group.tags.map((tag) => {
                const selected = tags.includes(tag);
                // 5개를 다 고르면 나머지 태그는 누를 수 없게
                const disabled = !selected && tags.length >= MAX_TAGS;
                return (
                  <li key={tag}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={disabled}
                      className={selected ? `${styles.tag} ${styles.tagActive}` : styles.tag}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <button type="button" className={styles.saveButton} disabled={!canSave} onClick={save}>
        저장하기
      </button>
    </main>
  );
}
