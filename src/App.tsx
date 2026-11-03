import { Route, Routes } from 'react-router';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// 새 화면은 여기에 Route 추가 (404는 항상 맨 아래)
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
