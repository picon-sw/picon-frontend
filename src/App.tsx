import { Route, Routes } from 'react-router';
import { MainLayout } from './components/MainLayout';
import { ContestPage } from './pages/ContestPage';
import { ExploreAiSearchPage } from './pages/ExploreAiSearchPage';
import { ExploreAiSearchResultPage } from './pages/ExploreAiSearchResultPage';
import { ExplorePage } from './pages/ExplorePage';
import { ExploreSearchPage } from './pages/ExploreSearchPage';
import { ExploreSearchResultPage } from './pages/ExploreSearchResultPage';
import { HomePage } from './pages/HomePage';
import { MyActivityPage } from './pages/MyActivityPage';
import { MyPage } from './pages/MyPage';
import { MySettingsPage } from './pages/MySettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PhotographerProfilePage } from './pages/PhotographerProfilePage';
import { RequestDonePage } from './pages/RequestDonePage';
import { RequestExpertsPage } from './pages/RequestExpertsPage';
import { RequestPage } from './pages/RequestPage';
import { RequestTypePage } from './pages/RequestTypePage';

// 새 화면은 여기에 Route 추가 (404는 항상 맨 아래)
// 하단바가 필요한 화면은 MainLayout 안에, 필요 없는 화면은 바깥에 추가
export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/ai" element={<ExploreAiSearchPage />} />
        <Route path="/explore/ai/results" element={<ExploreAiSearchResultPage />} />
        <Route path="/explore/search" element={<ExploreSearchPage />} />
        <Route path="/explore/results" element={<ExploreSearchResultPage />} />
        <Route
          path="/explore/photographers/:photographerId"
          element={<PhotographerProfilePage />}
        />
        <Route path="/requests" element={<RequestPage />} />
        <Route path="/contests" element={<ContestPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/activity" element={<MyActivityPage />} />
        <Route path="/my/settings" element={<MySettingsPage />} />
      </Route>
      <Route path="/requests/new" element={<RequestTypePage />} />
      <Route path="/requests/new/experts" element={<RequestExpertsPage />} />
      <Route path="/requests/done" element={<RequestDonePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
