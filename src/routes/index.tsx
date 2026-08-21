import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const AppShell = lazy(() => import('../components/layout/AppShell'));
const ProductRuntime = lazy(() => import('../components/ProductRuntime'));
const SetupPage = lazy(() => import('../pages/SetupPage'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const SwapPage = lazy(() => import('../pages/SwapPage'));
const ReportPage = lazy(() => import('../pages/ReportPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 text-sm text-text-secondary">
      正在加载…
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<ProductRuntime />}>
          <Route element={<AppShell />}>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 全屏子页面 (无底部导航) */}
          <Route path="/chat/:boyfriendId" element={<ChatPage />} />

          {/* 暂未完成的实验功能不在公开测试中展示，旧链接安全返回首页 */}
          <Route path="/vr/*" element={<Navigate to="/home" replace />} />
          <Route path="/voice/*" element={<Navigate to="/home" replace />} />
          <Route path="/compare" element={<Navigate to="/home" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
