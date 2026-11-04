import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';

// 하단바가 있는 화면들의 공통 틀. 현재 페이지는 <Outlet /> 자리에 그려짐
export function MainLayout() {
  return (
    <div className={styles.layout}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
