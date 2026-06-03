import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ComparePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-300">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-black/60" />
        </button>
        <span className="text-sm font-medium">换乘对比</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚖️</span>
          </div>
          <p className="text-black/40 text-sm">换乘前 vs 换乘后对比</p>
          <p className="text-black/20 text-xs mt-2">Compare Page · 占位组件</p>
        </div>
      </div>
    </div>
  );
}
