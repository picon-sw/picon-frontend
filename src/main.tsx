import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { restoreSession } from './api/auth';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient();

// 새로고침해도 로그인을 유지하도록 화면을 그리기 전에 재발급 시작
restoreSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
