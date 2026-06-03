import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Volume2, Camera } from 'lucide-react';
import { useBoyfriendStore } from '../stores';

export default function VRPage() {
  const { boyfriendId } = useParams<{ boyfriendId: string }>();
  const navigate = useNavigate();
  const bf = useBoyfriendStore((s) =>
    boyfriendId
      ? s.availableBoyfriends.find((b) => b.id === boyfriendId)
      : s.currentBoyfriend
  );

  return (
    <div className="flex flex-col min-h-full relative" style={{ background: bf?.vrScene.ambientColor ?? '#1a1a2e' }}>
      {/* 顶部控制栏 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Volume2 size={18} className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Maximize size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* VR 场景主体 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <span className="text-5xl">🌌</span>
        </div>
        {bf && (
          <p className="text-white/80 text-lg font-medium">{bf.name}</p>
        )}
        <p className="text-white/30 text-xs mt-2">VR 沉浸模式 · 占位组件</p>
      </div>

      {/* 底部快捷操作 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 px-4 py-6">
        <button className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
          <Camera size={22} className="text-white" />
        </button>
        <button className="px-8 py-3 rounded-full bg-brand-500 text-white font-medium text-sm">
          💬 聊天
        </button>
        <button className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
          <span className="text-white text-lg">👋</span>
        </button>
      </div>
    </div>
  );
}
