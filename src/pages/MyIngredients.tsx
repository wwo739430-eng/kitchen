/**
 * My Ingredients Page
 * 我的食材页面 - 拍立得风格 + 手动输入食材
 */
import { useState, useEffect } from 'react';
import { ingredientAPI, type Ingredient } from '../services/api';
import { useNavigate } from 'react-router-dom';

// ========== 常量定义 ==========
const CATEGORIES = [
  { value: '蔬菜', label: '🥬 蔬菜' },
  { value: '肉蛋', label: '🍗 肉蛋' },
  { value: '海鲜', label: '🐟 海鲜' },
  { value: '主食', label: '🍚 主食' },
  { value: '调料', label: '🫗 调料' },
  { value: '水果', label: '🍎 水果' },
  { value: '饮品', label: '🥛 饮品' },
  { value: '其他', label: '📦 其他' },
];

const STORAGE_OPTIONS = [
  { value: 'fridge', label: '❄️ 冷藏' },
  { value: 'freezer', label: '🧊 冷冻' },
  { value: 'pantry', label: '🏠 常温' },
];

// ========== 保质期工具函数 ==========
function getExpiryInfo(expirationDate?: string): { text: string; colorClass: string; isExpired: boolean; daysLeft: number | null } {
  if (!expirationDate) return { text: '', colorClass: '', isExpired: false, daysLeft: null };
  
  const exp = new Date(expirationDate + 'T23:59:59');
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) {
    return { text: `已过期 ${Math.abs(daysLeft)} 天`, colorClass: 'text-red-500 bg-red-50 border-red-200', isExpired: true, daysLeft };
  } else if (daysLeft <= 2) {
    return { text: `⚠️ 还剩 ${daysLeft} 天`, colorClass: 'text-orange-500 bg-orange-50 border-orange-200', isExpired: false, daysLeft };
  } else if (daysLeft <= 7) {
    return { text: `还剩 ${daysLeft} 天`, colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200', isExpired: false, daysLeft };
  } else {
    const dateStr = new Date(expirationDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    return { text: `到期 ${dateStr}`, colorClass: 'text-gray-500 bg-gray-50 border-gray-200', isExpired: false, daysLeft };
  }
}

// ========== 主组件 ==========
export default function MyIngredients() {
  const [ingredients, setIngredients] = useState<{
    fridge: Ingredient[];
    freezer: Ingredient[];
    pantry: Ingredient[];
  }>({ fridge: [], freezer: [], pantry: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 弹窗状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '蔬菜',
    quantity: '',
    storage_location: 'pantry' as Ingredient['storage_location'],
    expiration_date: '',
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  // 加载食材
  const loadIngredients = async () => {
    try {
      const result = await ingredientAPI.getAll();
      const payload = result.ingredients;
      const grouped: { fridge: Ingredient[]; freezer: Ingredient[]; pantry: Ingredient[] } = {
        fridge: [],
        freezer: [],
        pantry: [],
      };
      for (const ing of payload) {
        const loc = ing?.storage_location || 'pantry';
        if (loc === 'fridge') grouped.fridge.push(ing);
        else if (loc === 'freezer') grouped.freezer.push(ing);
        else grouped.pantry.push(ing);
      }
      setIngredients(grouped);
    } catch (error) {
      console.error('加载食材失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新列表（增删改后调用）
  const refreshAndClose = async () => {
    setShowAddForm(false);
    setForm({ name: '', category: '蔬菜', quantity: '', storage_location: 'pantry', expiration_date: '' });
    setLoading(true);
    await loadIngredients();
  };

  // 提交表单 - 添加新食材
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('请输入食材名称');
      return;
    }

    setFormSaving(true);
    try {
      await ingredientAPI.add({
        name: form.name.trim(),
        quantity: form.quantity || '1份',
        category: form.category,
        state: '新鲜',
        storage_location: form.storage_location,
        expiration_date: form.expiration_date || undefined,
      });
      await refreshAndClose();
    } catch (err) {
      console.error('添加失败:', err);
      alert('添加失败，请稍后重试');
      setFormSaving(false);
    }
  };

  // 数量变更
  const handleQuantityChange = async (id: number, delta: number) => {
    try {
      const allIngs = [...ingredients.fridge, ...ingredients.freezer, ...ingredients.pantry];
      const current = allIngs.find(i => i.id === id);
      if (!current) return;

      const qtyStr = current.quantity.replace(/[^\d.]/g, '');
      let numVal = parseFloat(qtyStr) || 0;
      numVal += delta;
      if (numVal < 0) numVal = 0;
      
      const unitMatch = current.quantity.match(/[^\d.]+$/);
      const unit = unitMatch ? unitMatch[0].trim() : '';
      await ingredientAPI.update(id, { quantity: `${numVal}${unit}` || '0' });
      await refreshAndClose();
    } catch (err) {
      console.error('更新数量失败:', err);
    }
  };

  // 删除食材
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个食材吗？')) return;
    try {
      await ingredientAPI.delete(id);
      await refreshAndClose();
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请稍后重试');
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">refresh</span>
          <p className="text-gray-600 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  // 渲染区域
  function renderSection(
    title: string,
    icon: React.ReactNode,
    iconBg: string,
    list: Ingredient[],
    emptyText: string,
    rotations: string[]
  ) {
    return (
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className={`size-10 ${iconBg} rounded-2xl flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="text-2xl font-black text-[#2c3327]">{title}</h3>
          <div className="h-px bg-gray-200 grow ml-4"></div>
          <span className="text-sm font-bold text-gray-400">{list.length} 件</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {list.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-12">{emptyText}</p>
          ) : (
            list.map((ing) => {
              const rotation = rotations[list.indexOf(ing) % rotations.length];
              const expiryInfo = getExpiryInfo(ing.expiration_date);

              return (
                <div
                  key={ing.id}
                  className="polaroid bg-white dark:bg-[#22261d] p-4 pb-6 border border-gray-100 dark:border-white/5 relative group"
                  style={{ transform: `rotate(${rotation})` }}
                >
                  {/* 和纸胶带 */}
                  <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 z-10 opacity-70"></div>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDelete(ing.id!)}
                    className="absolute top-1 right-1 size-7 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20 flex items-center justify-center"
                    title="删除"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>

                  {/* 图标区域 */}
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/10 to-primary/20 rounded-sm mb-4 shadow-inner flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl">{getIngredientIcon(ing.name)}</span>
                    {expiryInfo.isExpired && (
                      <div className="absolute top-1 right-1 size-5 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* 名称 */}
                  <p className="text-lg font-black text-[#2c3327] text-center truncate" title={ing.name}>
                    {ing.name}
                  </p>

                  {/* 分类标签 */}
                  {ing.category && (
                    <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mx-auto mt-1">
                      {ing.category}
                    </span>
                  )}

                  {/* 数量控制 */}
                  <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-white/5 rounded-full px-2 py-1 mt-3">
                    <button
                      onClick={() => handleQuantityChange(ing.id!, -1)}
                      className="size-7 rounded-full bg-white dark:bg-[#2c3327] text-primary shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                      title="减少"
                    >
                      <span className="material-symbols-outlined text-xs">remove</span>
                    </button>
                    <span className="font-black text-primary text-sm min-w-[40px] text-center">
                      {(ing.quantity || '').split(/(\d+)/)[1] || ''}{(ing.quantity || '').replace(/\d+/g, '') && <small className="text-[9px] text-gray-400 ml-0.5">{(ing.quantity || '').replace(/\d+/, '')}</small>}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(ing.id!, 1)}
                      className="size-7 rounded-full bg-primary text-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                      title="增加"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                    </button>
                  </div>

                  {/* 保质期 */}
                  {expiryInfo.text && (
                    <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border text-center truncate ${expiryInfo.colorClass}`}>
                      {expiryInfo.text}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-[#141513] dark:text-white tracking-tight flex items-center gap-3">
              我的食材库
              <span className="material-symbols-outlined text-primary text-4xl fill-1">kitchen</span>
            </h2>
            <p className="text-[#757b6f] text-lg font-medium">看一看今天冰箱里还有什么宝贝？🍎</p>
          </div>
          <div className="flex gap-3">
            {/* 手动添加按钮 */}
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2.5 rounded-full bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              添加食材
            </button>
            <button onClick={() => navigate('/scan')} className="px-6 py-2.5 rounded-full bg-white dark:bg-[#22261d] text-primary font-black text-sm border-2 border-primary/20 hover:border-primary transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">document_scanner</span>
              扫描小票入库
            </button>
            <button className="px-6 py-2.5 rounded-full bg-white dark:bg-[#22261d] text-primary font-black text-sm border-2 border-primary/20 hover:border-primary transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_alt</span> 筛选
            </button>
          </div>
        </div>

        {/* 冷藏区 */}
        {renderSection(
          '冷藏 (Fridge)',
          <span className="material-symbols-outlined text-blue-500">ac_unit</span>,
          'bg-sky-blue',
          ingredients.fridge,
          '冷藏区空空的～点「添加食材」填满它吧！',
          ['-1.5deg', '1deg', '-0.5deg', '2deg']
        )}

        {/* 冷冻区 */}
        {renderSection(
          '冷冻 (Freezer)',
          <span className="material-symbols-outlined text-blue-600">severe_cold</span>,
          'bg-blue-100',
          ingredients.freezer,
          '冷冻区还没有东西哦',
          ['1.5deg', '-1deg', '0.5deg', '-2deg']
        )}

        {/* 常温区 */}
        {renderSection(
          '常温 (Pantry)',
          <span className="material-symbols-outlined text-orange-600">inventory_2</span>,
          'bg-orange-100',
          ingredients.pantry,
          '常温区还没有食材哦～',
          ['-1deg', '1.5deg', '-0.5deg', '2deg']
        )}

        {/* Cloudy Tips */}
        <div className="max-w-md mx-auto">
          <div className="bg-sky-blue/30 rounded-3xl p-8 relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="size-20 bg-white rounded-full flex items-center justify-center border-4 border-sky-blue/50 shadow-xl">
                <span className="material-symbols-outlined text-primary text-5xl">cloudy</span>
              </div>
            </div>
            <div className="pt-8 text-center">
              <p className="font-black text-xl mb-3 text-primary">Cloudy 提醒你</p>
              <p className="text-sm text-[#757b6f] font-bold italic leading-relaxed">
                "记得定期检查食材的新鲜度哦！如果有即将过期的食材，不妨让我帮你想想怎么用掉它们吧～"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 手动添加食材弹窗 ========== */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
          <div className="bg-white dark:bg-[#22261d] rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in duration-200">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 size-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-gray-400">close</span>
            </button>

            {/* 标题 */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-[#141513] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">add_shopping_cart</span>
                添加食材
              </h3>
              <p className="text-sm text-gray-500 mt-1">手动录入你的食材信息</p>
            </div>

            {/* 表单 */}
            <form onSubmit={handleAddSubmit} className="space-y-5">

              {/* 食材名称 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  食材名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：西红柿、鸡蛋、牛奶..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                  autoFocus
                />
              </div>

              {/* 种类 & 数量 并排 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">种类</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium appearance-none bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">数量</label>
                  <input
                    type="text"
                    placeholder="例如：3个、500g、1盒"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* 存储位置 & 保质期 并排 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">存放位置</label>
                  <div className="flex gap-2">
                    {STORAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, storage_location: opt.value as Ingredient['storage_location'] })}
                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          form.storage_location === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {opt.label.split(' ')[0]}<br />{opt.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    保质期 <small className="text-gray-400 font-normal">(可选)</small>
                  </label>
                  <input
                    type="date"
                    value={form.expiration_date}
                    onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={formSaving || !form.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {formSaving ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      保存中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">add_circle</span>
                      确认添加
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ========== 简易图标映射 ==========
const emojiMap: Record<string, string> = {
  '西红柿': '🍅', '番茄': '🍅', '黄瓜': '🥒', '萝卜': '🥕', '胡萝卜': '🥕',
  '土豆': '🥔', '洋葱': '🧅', '白菜': '🥬', '菠菜': '🥬', '生菜': '🥬',
  '青椒': '🫑', '辣椒': '🌶️', '芹菜': '🌿', '韭菜': '🌿', '茄子': '🍆',
  '南瓜': '🎃', '冬瓜': '🥒', '苦瓜': '🥒', '豆芽': '🌱', '玉米': '🌽',
  '蘑菇': '🍄', '香菇': '🍄',
  '鸡蛋': '🥚', '鸡肉': '🍗', '猪肉': '🥩', '牛肉': '🥩', '羊肉': '🥩',
  '排骨': '🍖', '鱼': '🐟', '虾': '🦐', '蟹': '🦀', '虾仁': '🦐',
  '香肠': '🌭', '培根': '🥓', '火腿': '🍖',
  '米饭': '🍚', '面条': '🍜', '饺子': '🥟', '包子': '🥟', '馒头': '🍞',
  '面包': '🍞', '年糕': '🍡', '米粉': '🍜', '意面': '🍝',
  '大蒜': '🧄', '姜': '🫚', '葱': '🧅', '酱油': '🫗', '醋': '🫗',
  '油': '🛢️', '盐': '🧂', '糖': '🍬', '料酒': '🍶',
  '豆腐': '🧈', '豆浆': '🥛', '牛奶': '🥛', '奶酪': '🧀', '黄油': '🧈',
  '海苔': '🍙', '寿司': '🍣', '芝麻': '⚫', '花生': '🥜',
};

function getIngredientIcon(name: string): string {
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.includes(key)) return emoji;
  }
  if (/肉|骨|排|腿|翅/.test(name)) return '🥩';
  if (/菜|瓜|果|豆|菇|笋|椒|葱|姜|蒜|芹/.test(name)) return '🥬';
  if (/蛋|奶|酪|油/.test(name)) return '🥚';
  if (/米|面|粉|包|饺|饼|馒|饭/.test(name)) return '🍚';
  if (/鱼|虾|蟹|贝|海鲜/.test(name)) return '🐟';
  if (/酱|醋|酒|盐|糖/.test(name)) return '🫗';
  if (/果|莓|蕉|橙|苹果/.test(name)) return '🍎';
  return '🔸';
}
