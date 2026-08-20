import { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { autoSave, initializeApp } from './core/productBootstrap';
import { trackAppLaunch, trackBootstrap } from './core/analyticsEngine';
import { isFeatureEnabled } from './core/releaseEngine';
import { DEBUG_FLAGS } from './config/env';

export default function App() {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    // 1) 产品启动引导
    const result = initializeApp();

    // 2) 分析埋点: App启动
    trackAppLaunch(result.userState, result.readyScore);
    trackBootstrap({
      userState: result.userState,
      restored: result.restored,
      readyScore: result.readyScore,
    });

    // 3) 调试日志
    if (DEBUG_FLAGS.showBootstrapLogs) {
      console.log(
        `[BondShift] 启动完成 | 状态: ${result.userState} | 恢复: ${result.restored} | 就绪度: ${result.readyScore}/100`,
      );
      if (result.validation.warnings.length > 0) {
        console.warn('[BondShift] 校验警告:', result.validation.warnings);
      }
      if (isFeatureEnabled('metricsCollection')) {
        console.log('[BondShift] 产品指标收集已启用');
      }
    }
  }, []);

  useEffect(() => {
    const saveChatState = () => autoSave();
    window.addEventListener('bondshift:chat-changed', saveChatState);
    return () => window.removeEventListener('bondshift:chat-changed', saveChatState);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
