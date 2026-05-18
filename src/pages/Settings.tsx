/**
 * Settings Page
 * 设置页面 - 饮食偏好设置（口味、菜系、健身目标等）
 */
import { useState, useEffect } from 'react';
import { preferencesAPI, type UserPreferences } from '../services/api';

// ========== 常量定义 ==========

const TASTE_OPTIONS = [
  {
    value: 'light' as const,
    label: '清淡饮食',
    desc: '少油少盐，健康清淡',
    icon: '🌿',
    color: 'from-green-50 to-emerald-50 border-green-200 text-green-700',
    activeColor: 'bg-green-100 border-green-400 text-green-800',
  },
  {
    value: 'heavy' as const,
    label: '重口味',
    desc: '重油重辣，过瘾！',
    icon: '🌶️',
    color: 'from-red-50 to-orange-50 border-red-200 text-red-700',
    activeColor: 'bg-red-100 border-red-400 text-red-800',
  },
  {
    value: 'medium' as const,
    label: '家常味道',
    desc: '正常调味，不咸不淡',
    icon: '🏠',
    color: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-100 border-amber-400 text-amber-800',
  },
];

const CUISINE_OPTIONS = [
  { value: 'home' as const, label: '🏠 家常菜', desc: '最接地气的味道' },
  { value: 'sichuan' as const, label: '🌶️ 川菜', desc: '麻辣鲜香' },
  { value: 'cantonese' as const, label: '🦆 粤菜', desc: '清淡鲜美' },
  { value: 'jiangsu' as const, label: '🍜 淮扬菜', desc: '精致细腻' },
  { value: 'shandong' as const, label: '🐟 鲁菜', desc: '咸鲜醇厚' },
  { value: 'zhejiang' as const, label: '🍃 浙菜', desc: '鲜嫩软滑' },
  { value: 'fujian' as const, label: '🦐 闽菜', desc: '鲜香清淡' },
  { value: 'anhui' as const, label: '🫕 徽菜', desc: '重油重色' },
  { value: 'western' as const, label: '🍝 西式', desc: '西餐做法' },
];

const FITNESS_OPTIONS = [
  {
    value: 'fat_loss' as const,
    label: '减脂',
    desc: '低卡低脂，控制热量',
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-500',
    detail: '每餐约300-450卡，高蛋白低碳水',
  },
  {
    value: 'muscle_gain' as const,
    label: '增肌',
    desc: '高蛋白，适量碳水',
    icon: '💪',
    gradient: 'from-orange-500 to-red-500',
    detail: '每餐至少25g蛋白质，营养密集',
  },
  {
    value: 'maintain' as const,
    label: '保持',
    desc: '均衡营养就好',
    icon: '☀️',
    gradient: 'from-green-500 to-emerald-500',
    detail: '正常饮食，注重营养平衡',
  },
];

const TIME_OPTIONS = [
  { value: 'quick' as const, label: '⚡ 快手菜', desc: '15分钟内搞定', time: '15min' },
  { value: 'normal' as const, label: '👨‍🍳 正常时间', desc: '30分钟左右', time: '30min' },
  { value: 'leisure' as const, label: '🐢 慢煮细炖', desc: '60分钟以上', time: '60min+' },
];

const COMMON_RESTRICTIONS = ['不吃辣', '不吃香菜', '不吃葱', '不吃蒜', '不吃牛肉', '不吃猪肉', '不吃海鲜', '素食', '无麸质', '低糖'];

// ========== 主组件 ==========

export default function Settings() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [_saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [customRestriction, setCustomRestriction] = useState('');

  useEffect(() => {
    loadPrefs();
  }, []);

  async function loadPrefs() {
    try {
      const p = await preferencesAPI.get();
      setPrefs(p);
    } catch (e) {
      console.error('加载偏好失败:', e);
    } finally {
      setLoading(false);
    }
  }

  async function savePrefs(updates: Partial<UserPreferences>) {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await preferencesAPI.save(updates);
      setPrefs(updated);
      showToast();
    } catch (e) {
      console.error('保存失败:', e);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  function showToast() {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  }

  function toggleRestriction(item: string) {
    if (!prefs) return;
    const current = [...(prefs.dietary_restrictions || [])];
    if (current.includes(item)) {
      savePrefs({ dietary_restrictions: current.filter((r) => r !== item) });
    } else {
      savePrefs({ dietary_restrictions: [...current, item] });
    }
  }

  function addCustomRestriction() {
    if (!customRestriction.trim() || !prefs) return;
    const current = [...(prefs.dietary_restrictions || [])];
    if (!current.includes(customRestriction.trim())) {
      savePrefs({ dietary_restrictions: [...current, customRestriction.trim()] });
    }
    setCustomRestriction('');
  }

  // 加载中
  if (loading || !prefs) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">refresh</span>
          <p className="text-gray-600 mt-4">加载设置中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10">
          <h2 className="text-4xl font-black text-[#141513] dark:text-white tracking-tight flex items-center gap-3">
            饮食偏好
            <span className="material-symbols-outlined text-primary text-4xl fill-1">tune</span>
          </h2>
          <p className="text-[#757b6f] text-lg font-medium">告诉我你的口味和需求，AI 会为你推荐更合适的食谱 🎯</p>
        </div>

        {/* ====== 1. 口味偏好 ====== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 bg-gradient-to-br from-pink-100 to-red-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-xl">restaurant</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">口味偏好</h3>
            {!prefs.taste_preference && (
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">未设置</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TASTE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => savePrefs({ taste_preference: prefs.taste_preference === opt.value ? null : opt.value })}
                className={`relative p-5 rounded-2xl border-2 transition-all text-left group ${
                  prefs.taste_preference === opt.value
                    ? `${opt.activeColor} shadow-md scale-[1.02]`
                    : `bg-gradient-to-br ${opt.color} hover:scale-[1.02]`
                }`}
              >
                {prefs.taste_preference === opt.value && (
                  <span className="absolute top-3 right-3 size-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-sm text-green-600">check</span>
                  </span>
                )}
                <span className="text-3xl mb-2 block">{opt.icon}</span>
                <p className="font-black text-base">{opt.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ====== 2. 菜系风格 ====== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500 text-xl">ramen_dining</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">菜系风格</h3>
            {prefs.cuisine_style && (
              <button
                onClick={() => savePrefs({ cuisine_style: null })}
                className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                清除选择
              </button>
            )}
            {!prefs.cuisine_style && (
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">未设置</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {CUISINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  savePrefs({ cuisine_style: prefs.cuisine_style === opt.value ? null : opt.value })
                }
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                  prefs.cuisine_style === opt.value
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* ====== 3. 健身目标 ====== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500 text-xl">fitness_center</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">健身 / 目标</h3>
            {!prefs.fitness_goal && (
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">未设置</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FITNESS_OPTIONS.map((opt) => {
              const isActive = prefs.fitness_goal === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => savePrefs({ fitness_goal: prefs.fitness_goal === opt.value ? null : opt.value })}
                  className={`relative p-5 rounded-2xl border-2 transition-all text-left overflow-hidden ${
                    isActive
                      ? 'border-transparent shadow-lg scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* 背景渐变条 */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${opt.gradient}`} />
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-5`} />
                  )}

                  {isActive && (
                    <span className="absolute top-3 right-3 size-6 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
                      <span className="material-symbols-outlined text-sm text-green-600">check</span>
                    </span>
                  )}

                  <span className="text-3xl mb-2 block relative z-10">{opt.icon}</span>
                  <p className={`font-black text-base relative z-10 ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{opt.label}</p>
                  <p className="text-xs mt-1 relative z-10 opacity-70">{opt.desc}</p>
                  <p className={`text-[10px] mt-2 relative z-10 ${isActive ? 'text-gray-500' : 'text-gray-400'} font-medium`}>{opt.detail}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ====== 4. 烹饪时间 ====== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-500 text-xl">schedule</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">烹饪时间</h3>
            {!prefs.cooking_time && (
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">不限</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => savePrefs({ cooking_time: prefs.cooking_time === opt.value ? null : opt.value })}
                className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                  prefs.cooking_time === opt.value
                    ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt.label}
                <span className={`block text-[10px] mt-0.5 font-normal ${
                  prefs.cooking_time === opt.value ? 'text-purple-500' : 'text-gray-400'
                }`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ====== 5. 饮食限制 / 忌口 ====== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-xl">block</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">忌口 & 饮食限制</h3>
            {(prefs.dietary_restrictions?.length ?? 0) > 0 && (
              <span className="text-xs font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                已选 {prefs.dietary_restrictions?.length} 项
              </span>
            )}
          </div>

          {/* 常见标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COMMON_RESTRICTIONS.map((item) => {
              const isSelected = prefs.dietary_restrictions?.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleRestriction(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-red-100 border-red-300 text-red-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {item}
                </button>
              );
            })}
          </div>

          {/* 自定义输入 */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="输入其他忌口（如：不吃花生、过敏原...）"
              value={customRestriction}
              onChange={(e) => setCustomRestriction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomRestriction()}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-10 outline-none text-sm"
            />
            <button
              onClick={addCustomRestriction}
              disabled={!customRestriction.trim()}
              className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              添加
            </button>
          </div>

          {/* 已选列表 */}
          {(prefs.dietary_restrictions?.length ?? 0) > 0 && (
            <div className="mt-4 p-4 bg-red-50/50 rounded-xl">
              <p className="text-xs font-bold text-red-500 mb-2">当前限制：</p>
              <div className="flex flex-wrap gap-1.5">
               {prefs.dietary_restrictions!.map((r: string) => (
                  <span
                    key={r}
                    onClick={() => toggleRestriction(r)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-red-200 text-red-600 rounded-md text-xs font-bold cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    {r}
                    <span className="material-symbols-outlined text-[10px] hover:text-red-800">close</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ====== 重置按钮 ====== */}
        <div className="flex items-center justify-between pt-6 border-t border-dashed border-gray-200">
          <div>
            <p className="text-sm text-gray-500">所有设置自动保存到本地浏览器</p>
            <p className="text-xs text-gray-400 mt-0.5">切换设备后需重新设置</p>
          </div>
          <button
            onClick={async () => {
              if (!confirm('确定要清除所有饮食偏好吗？')) return;
              await preferencesAPI.reset();
              loadPrefs();
            }}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">restart_alt</span>
            全部重置
          </button>
        </div>

        {/* 保存成功 Toast */}
        {savedToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
              <span className="font-bold text-sm">已保存 ✓</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
