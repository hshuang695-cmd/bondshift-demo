import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PhoneOff, MicOff, Volume2 } from 'lucide-react';
import { useBoyfriendStore } from '../stores';

export default function VoiceCallPage() {
  const { boyfriendId } = useParams<{ boyfriendId: string }>();
  const navigate = useNavigate();
  const bf = useBoyfriendStore((s) =>
    s.availableBoyfriends.find((b) => b.id === boyfriendId)
  );

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-brand-100 to-surface-0">
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} className="text-black/60" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-28 h-28 rounded-full bg-brand-200 flex items-center justify-center">
          <span className="text-5xl">🎤</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{bf?.name ?? '未知'}</p>
          <p className="text-sm text-brand-500 mt-1">通话中 · 00:42</p>
        </div>
        <div className="flex items-center gap-2">
          {[0.3, 0.6, 1, 0.7, 0.4].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-brand-400 rounded-full animate-pulse"
              style={{ height: `${h * 40}px`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 px-4 py-8">
        <button className="p-4 rounded-full bg-surface-200">
          <MicOff size={22} className="text-black/40" />
        </button>
        <button className="p-5 rounded-full bg-red-500">
          <PhoneOff size={26} className="text-white" />
        </button>
        <button className="p-4 rounded-full bg-surface-200">
          <Volume2 size={22} className="text-black/40" />
        </button>
      </div>
    </div>
  );
}
