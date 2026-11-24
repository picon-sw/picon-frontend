import { Route, Routes } from 'react-router';
import { MainLayout } from './components/MainLayout';
import { ContestPage } from './pages/ContestPage';
import { ExplorePage } from './pages/ExplorePage';
import { ExploreSearchPage } from './pages/ExploreSearchPage';
import { ExploreSearchResultPage } from './pages/ExploreSearchResultPage';
import { HomePage } from './pages/HomePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { MyActivityPage } from './pages/MyActivityPage';
import { MyFaqPage } from './pages/MyFaqPage';
import { MyNoticeDetailPage } from './pages/MyNoticeDetailPage';
import { MyNoticesPage } from './pages/MyNoticesPage';
import { MyNotificationSettingsPage } from './pages/MyNotificationSettingsPage';
import { MyPage } from './pages/MyPage';
import { MyProfileEditPage } from './pages/MyProfileEditPage';
import { MySettingsPage } from './pages/MySettingsPage';
import { MySupportPage } from './pages/MySupportPage';
import { MyTasteEditPage } from './pages/MyTasteEditPage';
import { MyTermsDetailPage } from './pages/MyTermsDetailPage';
import { MyTermsPage } from './pages/MyTermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PhotographerProfilePage } from './pages/PhotographerProfilePage';
import { RequestDonePage } from './pages/RequestDonePage';
import { RequestEditPage } from './pages/RequestEditPage';
import { RequestExpertProfilePage } from './pages/RequestExpertProfilePage';
import { RequestExpertsPage } from './pages/RequestExpertsPage';
import { RequestInquiriesPage } from './pages/RequestInquiriesPage';
import { RequestPage } from './pages/RequestPage';
import { RequestPhotoPickPage } from './pages/RequestPhotoPickPage';
import { RequestPhotoPurchasePage } from './pages/RequestPhotoPurchasePage';
import { RequestProposalDetailPage } from './pages/RequestProposalDetailPage';
import { RequestProposalsPage } from './pages/RequestProposalsPage';
import { RequestPurchasedPage } from './pages/RequestPurchasedPage';
import { RequestQuotePage } from './pages/RequestQuotePage';
import { RequestReservationPage } from './pages/RequestReservationPage';
import { RequestReservedPage } from './pages/RequestReservedPage';
import { RequestShootPage } from './pages/RequestShootPage';
import { RequestTypePage } from './pages/RequestTypePage';

// 새 화면은 여기에 Route 추가 (404는 항상 맨 아래)
// 하단바가 필요한 화면은 MainLayout 안에, 필요 없는 화면은 바깥에 추가
export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
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
        <Route path="/my/profile/edit" element={<MyProfileEditPage />} />
        <Route path="/my/taste/edit" element={<MyTasteEditPage />} />
        <Route path="/my/settings" element={<MySettingsPage />} />
        <Route path="/my/settings/notifications" element={<MyNotificationSettingsPage />} />
        <Route path="/my/settings/notices" element={<MyNoticesPage />} />
        <Route path="/my/settings/notices/:noticeId" element={<MyNoticeDetailPage />} />
        <Route path="/my/settings/faq" element={<MyFaqPage />} />
        <Route path="/my/settings/support" element={<MySupportPage />} />
        <Route path="/my/settings/terms" element={<MyTermsPage />} />
        <Route path="/my/settings/terms/:termsId" element={<MyTermsDetailPage />} />
      </Route>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/onboarding/:step" element={<OnboardingPage />} />
      <Route path="/requests/new" element={<RequestTypePage />} />
      <Route path="/requests/new/shoot" element={<RequestShootPage />} />
      <Route path="/requests/new/edit" element={<RequestEditPage />} />
      <Route path="/requests/new/experts" element={<RequestExpertsPage />} />
      <Route path="/requests/new/experts/:expertId" element={<RequestExpertProfilePage />} />
      <Route path="/requests/done" element={<RequestDonePage />} />
      <Route path="/requests/:requestId/proposals" element={<RequestProposalsPage />} />
      <Route
        path="/requests/:requestId/proposals/:expertId"
        element={<RequestProposalDetailPage />}
      />
      <Route path="/requests/:requestId/proposals/:expertId/quote" element={<RequestQuotePage />} />
      <Route path="/requests/:requestId/reserved" element={<RequestReservedPage />} />
      <Route path="/requests/:requestId/reservation" element={<RequestReservationPage />} />
      <Route path="/requests/:requestId/inquiries" element={<RequestInquiriesPage />} />
      <Route path="/requests/:requestId/photos" element={<RequestPhotoPickPage />} />
      <Route path="/requests/:requestId/photos/purchase" element={<RequestPhotoPurchasePage />} />
      <Route path="/requests/:requestId/purchased" element={<RequestPurchasedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
