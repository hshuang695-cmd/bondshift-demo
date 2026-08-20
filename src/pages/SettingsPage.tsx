import { motion } from 'framer-motion';
import {
  Bell, Volume2, Vibrate, Eye, Globe, Database,
  ChevronRight, Shield, Moon, Info,
  type LucideIcon,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useSettingsStore, useBoyfriendStore, useSwapStore, useChatStore } from '../stores';
import { EMPTY_USER_MEMORY } from '../stores/chatStore';

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  color?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}

function SettingRow({ icon: Icon, label, description, color, right, onClick }: SettingRowProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3.5 py-3.5 px-5 hover:bg-surface-50 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color ? `${color}15` : '#f5f1f2' }}
      >
        <Icon size={18} style={{ color: color ?? '#8e8e93' }} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && (
          <p className="text-[11px] text-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
      {right ?? <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />}
    </motion.button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? 'bg-brand-500' : 'bg-surface-300'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export default function SettingsPage() {
  const {
    userProfile,
    notificationsEnabled, soundEnabled, vibrationEnabled, privacyMode,
    language, cacheSize,
    toggleNotification, toggleSound, toggleVibration, togglePrivacy,
    clearCache,
  } = useSettingsStore();

  const relationshipLevel = useBoyfriendStore((s) => s.relationshipLevel);
  const currentBoyfriendId = useBoyfriendStore((s) => s.currentBoyfriend?.id ?? '');
  const interactionCount = useBoyfriendStore(
    (s) => s.interactionHistory.filter((record) => record.boyfriendId === currentBoyfriendId).length,
  );
  const totalSwapCount = useSwapStore((s) => s.totalSwapCount);
  const relationshipScores = useBoyfriendStore((s) => s.relationshipScores);
  const memory = useChatStore(
    (s) => s.memoriesByBoyfriend[currentBoyfriendId] ?? EMPTY_USER_MEMORY,
  );

  const stageEmoji =
    relationshipScores.stage === 'deep_bond' ? '💝' :
    relationshipScores.stage === 'intimate' ? '💕' :
    relationshipScores.stage === 'close' ? '💛' :
    relationshipScores.stage === 'familiar' ? '🌱' : '👋';

  const stageLabel =
    relationshipScores.stage === 'deep_bond' ? '深度羁绊' :
    relationshipScores.stage === 'intimate' ? '亲密阶段' :
    relationshipScores.stage === 'close' ? '亲近阶段' :
    relationshipScores.stage === 'familiar' ? '熟悉阶段' : '初识阶段';

  return (
    <div className="flex flex-col min-h-full pb-4">
      <PageHeader title="设置中心" />

      <div className="px-5 mb-5">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💝</span>
          </div>
          <div>
            <p className="text-base font-bold text-text-primary">
              {userProfile?.nickname ?? '用户'}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Lv.{relationshipLevel} · 互动 {interactionCount} 次 · 换乘 {totalSwapCount} 次
            </p>
            <div className="mt-1.5 h-1.5 w-32 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full gradient-brand rounded-full"
                style={{ width: `${relationshipLevel * 10}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="card p-5">
          <p className="text-xs text-text-secondary font-semibold mb-3 uppercase tracking-wider">
            关系状态
          </p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{stageEmoji}</span>
            <div>
              <p className="text-sm font-bold text-text-primary">{stageLabel}</p>
              <p className="text-[11px] text-text-tertiary">
                综合分 {relationshipScores.overall} · Lv.{relationshipLevel}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: '信任', value: relationshipScores.trust, color: '#4f5fcf' },
              { label: '亲密', value: relationshipScores.intimacy, color: '#e8547c' },
              { label: '稳定', value: relationshipScores.stability, color: '#f56b33' },
            ].map((dim) => (
              <div key={dim.label} className="flex items-center gap-2">
                <span className="text-[10px] text-text-tertiary w-8">{dim.label}</span>
                <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${dim.value}%`, backgroundColor: dim.color }}
                  />
                </div>
                <span className="text-[10px] font-bold text-text-primary w-6 text-right">{dim.value}</span>
              </div>
            ))}
          </div>
          {memory.knownFacts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-100">
              <p className="text-[10px] text-text-tertiary mb-1">记忆片段</p>
              <p className="text-xs text-text-secondary">
                {memory.knownFacts.slice(-2).join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-text-secondary font-semibold px-5 mb-2 uppercase tracking-wider">
          通知与交互
        </p>
        <div className="card mx-5 overflow-hidden divide-y divide-surface-100">
          <SettingRow
            icon={Bell}
            label="消息通知"
            description="接收新消息和互动提醒"
            color="#e8547c"
            right={<Toggle checked={notificationsEnabled} onChange={toggleNotification} />}
          />
          <SettingRow
            icon={Volume2}
            label="声音效果"
            description="语音消息和场景音效"
            color="#4f5fcf"
            right={<Toggle checked={soundEnabled} onChange={toggleSound} />}
          />
          <SettingRow
            icon={Vibrate}
            label="震动反馈"
            description="操作触感反馈"
            color="#f56b33"
            right={<Toggle checked={vibrationEnabled} onChange={toggleVibration} />}
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-text-secondary font-semibold px-5 mb-2 uppercase tracking-wider">
          隐私与安全
        </p>
        <div className="card mx-5 overflow-hidden divide-y divide-surface-100">
          <SettingRow
            icon={Eye}
            label="隐私模式"
            description="隐藏敏感内容预览"
            color="#4f5fcf"
            right={<Toggle checked={privacyMode} onChange={togglePrivacy} />}
          />
          <SettingRow
            icon={Shield}
            label="数据权限"
            description="管理数据使用授权"
            color="#4f5fcf"
          />
          <SettingRow
            icon={Moon}
            label="深色模式"
            description="即将推出"
            color="#7d95e3"
            right={
              <span className="text-[11px] text-text-tertiary bg-surface-100 px-2 py-0.5 rounded-full">
                敬请期待
              </span>
            }
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-text-secondary font-semibold px-5 mb-2 uppercase tracking-wider">
          通用设置
        </p>
        <div className="card mx-5 overflow-hidden divide-y divide-surface-100">
          <SettingRow
            icon={Globe}
            label="语言"
            description="当前使用语言"
            color="#f56b33"
            right={
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-text-secondary">
                  {language === 'zh-CN' ? '简体中文' : 'English'}
                </span>
                <ChevronRight size={14} className="text-text-tertiary" />
              </div>
            }
          />
          <SettingRow
            icon={Database}
            label="缓存管理"
            description={`当前缓存 ${cacheSize}`}
            color="#e8547c"
            right={
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={clearCache}
                className="text-[11px] font-semibold text-brand-500 px-3 py-1.5 bg-brand-50 rounded-xl"
              >
                清理
              </motion.button>
            }
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-text-secondary font-semibold px-5 mb-2 uppercase tracking-wider">
          其他
        </p>
        <div className="card mx-5 overflow-hidden divide-y divide-surface-100">
          <SettingRow icon={Info} label="关于 BondShift" description="v1.0.0 可换乘男友模拟器" color="#2d2d2d" />
        </div>
      </div>

      <p className="text-center text-[10px] text-text-tertiary pb-2">
        BondShift v1.0 · Made with 💕
      </p>
    </div>
  );
}
