import { Link } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  // 뒤로 가기(←)를 누르면 이동할 주소
  backTo: string;
}

// 마이페이지 하위 화면 공통 헤더 (Figma "마이 - 설정 및 지원" 상단 앱바)
// 화면 좌우 여백과 상관없이 구분선이 화면 끝까지 닿도록,
// 페이지에서 --page-padding-left / --page-padding-right 값을 알려 줌
export function PageHeader({ title, backTo }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to={backTo} className={styles.back} aria-label="뒤로 가기">
        <img src={backIcon} alt="" />
      </Link>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
