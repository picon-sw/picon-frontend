import { NavLink } from 'react-router';
import contestActiveIcon from '../assets/icons/nav/contest-active.svg';
import contestIcon from '../assets/icons/nav/contest.svg';
import exploreActiveIcon from '../assets/icons/nav/explore-active.svg';
import exploreIcon from '../assets/icons/nav/explore.svg';
import homeActiveIcon from '../assets/icons/nav/home-active.svg';
import homeIcon from '../assets/icons/nav/home.svg';
import myActiveIcon from '../assets/icons/nav/my-active.svg';
import myIcon from '../assets/icons/nav/my.svg';
import requestActiveIcon from '../assets/icons/nav/request-active.svg';
import requestIcon from '../assets/icons/nav/request.svg';
import styles from './BottomNav.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '홈', icon: homeIcon, activeIcon: homeActiveIcon },
  { to: '/explore', label: '탐색', icon: exploreIcon, activeIcon: exploreActiveIcon },
  { to: '/requests', label: '의뢰', icon: requestIcon, activeIcon: requestActiveIcon },
  { to: '/contests', label: '콘테스트', icon: contestIcon, activeIcon: contestActiveIcon },
  { to: '/my', label: '마이', icon: myIcon, activeIcon: myActiveIcon },
];

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      {NAV_ITEMS.map(({ to, label, icon, activeIcon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
        >
          {({ isActive }) => (
            <>
              <span className={styles.iconSlot}>
                <img src={isActive ? activeIcon : icon} alt="" />
              </span>
              <span className={styles.label}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
