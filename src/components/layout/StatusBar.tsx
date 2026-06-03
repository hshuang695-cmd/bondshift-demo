import { useEffect, useState } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 h-11 select-none">
      <span className="text-xs font-semibold text-text-primary w-14 text-left">
        {time}
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <rect x="0" y="7.5" width="2.5" height="3.5" rx="0.5" fill="currentColor" className="text-text-primary" />
          <rect x="3.25" y="5.5" width="2.5" height="5.5" rx="0.5" fill="currentColor" className="text-text-primary" />
          <rect x="6.5" y="3" width="2.5" height="8" rx="0.5" fill="currentColor" className="text-text-primary" />
          <rect x="9.75" y="0" width="2.5" height="11" rx="0.5" fill="currentColor" className="text-text-primary" />
        </svg>
        <span className="text-[10px] font-medium text-text-primary">100%</span>
      </div>
    </div>
  );
}
