import { Route, Routes } from 'react-router';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * 📍 주소(URL)와 화면(page)을 연결하는 곳
 *
 * 새 화면을 만들었으면 아래 <Routes> 안에 한 줄 추가하면 끝이에요.
 *   <Route path="/login" element={<LoginPage />} />
 *
 * 주소 일부가 바뀌는 화면은 `:이름`을 써요. (상세 화면 등)
 *   <Route path="/photographers/:id" element={<PhotographerDetailPage />} />
 *   → /photographers/3, /photographers/15 모두 이 화면으로 와요
 *
 * ⚠️ path="*"(없는 주소 → 404)는 항상 맨 아래에 둬요.
 * 사용법 더 보기: README.md › "📘 처음 쓰는 라이브러리 사용법"
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
