import { Link, useParams } from 'react-router';
import { TERMS, type TermsBlock } from '../constants/terms';
import { PageHeader } from '../components/PageHeader';
import styles from './MyTermsPage.module.css';

interface TermsBlockViewProps {
  block: TermsBlock;
}

function TermsBlockView({ block }: TermsBlockViewProps) {
  if (block.type === 'list') {
    return (
      <ul className={styles.bulletList}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'labeled') {
    return (
      <p className={styles.paragraph}>
        <strong className={styles.label}>{block.label}:</strong> {block.text}
      </p>
    );
  }
  return <p className={styles.paragraph}>{block.text}</p>;
}

// 약관 상세 (/my/settings/terms/:termsId)
export function MyTermsDetailPage() {
  const { termsId } = useParams();
  const terms = TERMS.find(({ id }) => id === termsId);

  return (
    <main className={styles.page}>
      <PageHeader title="약관 및 정책" backTo="/my/settings/terms" />

      {terms ? (
        <article className={styles.document}>
          <h2 className={styles.documentTitle}>
            {terms.title}
            <span className={terms.required ? styles.badgeRequired : styles.badgeOptional}>
              {terms.required ? '필수' : '선택'}
            </span>
          </h2>
          <p className={styles.notice}>{terms.notice}</p>

          {terms.sections.map(({ heading, blocks }) => (
            <section key={heading} className={styles.section}>
              <h3 className={styles.sectionHeading}>{heading}</h3>
              {blocks.map((block, index) => (
                // 블록 순서는 바뀌지 않아 index를 key로 사용
                <TermsBlockView key={index} block={block} />
              ))}
            </section>
          ))}
        </article>
      ) : (
        <div className={styles.notFound}>
          <p>약관을 찾을 수 없어요.</p>
          <Link to="/my/settings/terms">약관 목록으로 돌아가기</Link>
        </div>
      )}
    </main>
  );
}
