import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import SetupPage from '../pages/SetupPage';
import HomePage from '../pages/HomePage';
import SwapPage from '../pages/SwapPage';
import ReportPage from '../pages/ReportPage';
import SettingsPage from '../pages/SettingsPage';
import ChatPage from '../pages/ChatPage';
import VRPage from '../pages/VRPage';
import VoiceCallPage from '../pages/VoiceCallPage';
import ComparePage from '../pages/ComparePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="swap" element={<SwapPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 全屏子页面 (无底部导航) */}
      <Route path="/chat/:boyfriendId" element={<ChatPage />} />
      <Route path="/vr" element={<VRPage />} />
      <Route path="/vr/:boyfriendId" element={<VRPage />} />
      <Route path="/voice/:boyfriendId" element={<VoiceCallPage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  );
}
