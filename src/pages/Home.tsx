/**
 * Home Page
 * 首页 - 拍立得风格的食谱推荐
 */
import { useState } from 'react';
import { recipeAPI, type Recipe, type Ingredient } from '../services/api';

// ========== 食材 → 图标/emoji 映射 ==========
const ingredientEmojiMap: Record<string, string> = {
  // 蔬菜类
  '西红柿': '🍅', '番茄': '🍅', '黄瓜': '🥒', '萝卜': '🥕', '胡萝卜': '🥕',
  '土豆': '🥔', '洋葱': '🧅', '白菜': '🥬', '菠菜': '🥬', '生菜': '🥬',
  '青椒': '🫑', '辣椒': '🌶️', '芹菜': '🌿', '韭菜': '🌿', '茄子': '🍆',
  '南瓜': '🎃', '冬瓜': '🥒', '苦瓜': '🥒', '豆芽': '🌱', '玉米': '🌽',
  '蘑菇': '🍄', '香菇': '🍄', '金针菇': '🍄',
  // 肉蛋类
  '鸡蛋': '🥚', '鸡肉': '🍗', '猪肉': '🥩', '牛肉': '🥩', '羊肉': '🥩',
  '排骨': '🍖', '鱼': '🐟', '虾': '🦐', '蟹': '🦀', '虾仁': '🦐',
  '香肠': '🌭', '培根': '🥓', '火腿': '🍖',
  // 主食类
  '米饭': '🍚', '面条': '🍜', '饺子': '🥟', '包子': '🥟', '馒头': '🍞',
  '面包': '🍞', '年糕': '🍡', '米粉': '🍜', '意面': '🍝', '乌冬面': '🍜',
  // 调料类
  '大蒜': '🧄', '姜': '🫚', '葱': '🧅', '酱油': '🫗', '醋': '🫗',
  '油': '🛢️', '盐': '🧂', '糖': '🍬', '料酒': '🍶', '蚝油': '🫗',
  // 其他
  '豆腐': '🧈', '豆浆': '🥛', '牛奶': '🥛', '奶酪': '🧀', '黄油': '🧈',
  '海苔': '🍙', '寿司': '🍣', '紫菜': '🌊', '芝麻': '⚫', '花生': '🥜',
};

function getIngredientIcon(name: string): string {
  for (const [key, emoji] of Object.entries(ingredientEmojiMap)) {
    if (name.includes(key) || key.includes(name)) return emoji;
  }
  // 默认按类别返回
  if (/肉|骨|排|腿|翅/.test(name)) return '🥩';
  if (/菜|瓜|果|豆|菇|笋|椒|葱|姜|蒜|芹/.test(name)) return '🥬';
  if (/蛋|奶|酪|油/.test(name)) return '🥚';
  if (/米|面|粉|包|饺|饼|馒|面包|饭/.test(name)) return '🍚';
  if (/鱼|虾|蟹|贝|海鲜/.test(name)) return '🐟';
  if (/酱|醋|酒|盐|糖|油|粉|精/.test(name)) return '🫗';
  return '🔸';
}

// ========== 食谱 → 图片映射 ==========
const recipeImageMap: Record<string, { emoji: string; gradient: string }> = {
  // 炒菜类
  '炒': { emoji: '🍳', gradient: 'from-amber-100 to-orange-100' },
  '番茄炒蛋': { emoji: '🍳', gradient: 'from-red-100 to-yellow-100' },
  '西红柿炒鸡蛋': { emoji: '🍳', gradient: 'from-red-100 to-yellow-100' },
  // 汤类
  '汤': { emoji: '🍲', gradient: 'from-blue-50 to-cyan-50' },
  '蛋花汤': { emoji: '🥣', gradient: 'from-yellow-50 to-orange-50' },
  // 面条类
  '面': { emoji: '🍜', gradient: 'from-yellow-100 to-amber-100' },
  '面条': { emoji: '🍜', gradient: 'from-yellow-100 to-amber-100' },
  '炒面': { emoji: '🍝', gradient: 'from-orange-100 to-red-50' },
  '拌面': { emoji: '🍜', gradient: 'from-amber-100 to-yellow-100' },
  // 米饭类
  '饭': { emoji: '🍚', gradient: 'from-green-50 to-emerald-50' },
  '盖浇饭': { emoji: '🍛', gradient: 'from-orange-50 to-red-50' },
  '煲仔饭': { emoji: '🍲', gradient: 'from-amber-100 to-orange-100' },
  '炒饭': { emoji: '🍳', gradient: 'from-yellow-100 to-amber-100' },
  // 火锅/炖煮
  '火锅': { emoji: '🫕', gradient: 'from-red-100 to-orange-100' },
  '炖': { emoji: '🍲', gradient: 'from-orange-50 to-amber-50' },
  '焖': { emoji: '🫕', gradient: 'from-amber-100 to-yellow-100' },
  '煮': { emoji: '🫕', gradient: 'from-blue-50 to-purple-50' },
  // 凉菜/沙拉
  '凉拌': { emoji: '🥗', gradient: 'from-green-100 to-lime-50' },
  '沙拉': { emoji: '🥗', gradient: 'from-green-50 to-emerald-50' },
  // 煎烤
  '煎': { emoji: '🥞', gradient: 'from-amber-50 to-yellow-50' },
  '烤': { emoji: '🍖', gradient: 'from-orange-100 to-red-100' },
  // 包点
  '饺子': { emoji: '🥟', gradient: 'from-yellow-50 to-amber-50' },
  '包': { emoji: '🥟', gradient: 'from-stone-100 to-amber-50' },
  // 日式
  '寿司': { emoji: '🍣', gradient: 'from-pink-50 to-red-50' },
  '刺身': { emoji: '🍱', gradient: 'from-red-50 to-pink-50' },
  // 西式
  '意面': { emoji: '🍝', gradient: 'from-yellow-100 to-orange-100' },
  '披萨': { emoji: '🍕', gradient: 'from-amber-100 to-yellow-100' },
  '三明治': { emoji: '🥪', gradient: 'from-amber-50 to-orange-50' },
  '汉堡': { emoji: '🍔', gradient: 'from-yellow-100 to-amber-100' },
};

function getRecipeImage(recipeName: string): { emoji: string; gradient: string } {
  // 先精确匹配
  if (recipeImageMap[recipeName]) return recipeImageMap[recipeName];
  // 再模糊匹配关键字
  for (const [key, value] of Object.entries(recipeImageMap)) {
    if (recipeName.includes(key)) return value;
  }
  // 默认
  return { emoji: '🍽️', gradient: 'from-primary/20 to-primary/30' };
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState(50); // 0-100 心情值

  const handleGenerateRecipes = async () => {
    setLoading(true);
    try {
      const mockIngredients: Ingredient[] = [
        { name: '鸡蛋', quantity: '6个', state: '新鲜' },
        { name: '西红柿', quantity: '4个', state: '新鲜' },
        { name: '米饭', quantity: '1碗', state: '常温' },
      ];

      const result = await recipeAPI.generate(mockIngredients, {
        scenario: mood < 30 ? '快手菜' : mood > 70 ? '硬菜' : '快手菜',
      });

      setRecipes(result.recipes || []);
    } catch (error) {
      console.error('生成食谱失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`AI 生成失败：${msg}\n\n可能原因：\n1. 后端服务未启动\n2. 网络连接问题\n3. AI 服务异常`);
    } finally {
      setLoading(false);
    }
  };

  const getMoodLabel = () => {
    if (mood < 30) return '心情低落';
    if (mood > 70) return '阳光灿烂';
    return '身体疲惫';
  };

  const getMoodIcon = () => {
    if (mood < 30) return 'cloudy';
    if (mood > 70) return 'sunny';
    return 'bedtime';
  };

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="flex items-center justify-between gap-6 mb-8 bg-soft-pink/40 p-8 rounded-3xl border-2 border-dashed border-soft-pink relative">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#141513] dark:text-white tracking-tight">
                今天心情怎么样？
              </h2>
              <p className="text-[#757b6f] text-lg font-medium">
                滑动滑块告诉我你的感受，我来为你寻找最治愈的美食！
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-soft-pink rotate-3 flex items-center gap-3 max-w-[200px]">
                <span className="material-symbols-outlined text-primary text-4xl animate-bounce">
                  face_6
                </span>
                <p className="text-sm font-bold leading-tight italic text-[#555]">
                  "累坏了吗？我准备了超简单食谱！"
                </p>
              </div>
            </div>
          </div>

          {/* Mood Slider */}
          <div className="bg-white dark:bg-[#22261d] p-8 rounded-3xl shadow-sm border border-[#e0e2df] dark:border-white/10 mb-12">
            <div className="flex justify-between items-end mb-8">
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="material-symbols-outlined text-4xl text-sky-blue group-hover:scale-110 transition-transform">
                  cloudy
                </span>
                <span className="text-xs font-black tracking-widest text-[#aab0a5]">心情低落</span>
              </div>
              <div className="h-[2px] bg-gray-100 grow mx-6 mb-4"></div>
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="material-symbols-outlined text-5xl text-primary scale-110">
                  {getMoodIcon()}
                </span>
                <span className="text-sm font-black tracking-widest text-primary">
                  {getMoodLabel()}
                </span>
              </div>
              <div className="h-[2px] bg-gray-100 grow mx-6 mb-4"></div>
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="material-symbols-outlined text-4xl text-orange-400 group-hover:scale-110 transition-transform">
                  sunny
                </span>
                <span className="text-xs font-black tracking-widest text-[#aab0a5]">阳光灿烂</span>
              </div>
            </div>
            <div className="relative flex items-center px-4">
              <div className="w-full h-5 bg-[#f0f2ef] dark:bg-white/5 rounded-full overflow-hidden p-1">
                <div
                  className="h-full bg-primary/40 rounded-full transition-all"
                  style={{ width: `${mood}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="absolute w-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute size-9 bg-white border-[6px] border-primary rounded-full shadow-xl cursor-grab active:cursor-grabbing mood-handle pointer-events-none"
                style={{ left: `${mood}%`, transform: 'translateX(-50%)' }}
              ></div>
            </div>
          </div>

          {/* Generate Button */}
          {recipes.length === 0 && (
            <div className="text-center mb-8">
              <button
                onClick={handleGenerateRecipes}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-black py-4 px-8 rounded-full text-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    AI 正在切菜...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">add_circle</span>
                    生成食谱推荐
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Recipe Grid */}
          {recipes.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8 px-4">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  给"{getMoodLabel()}"的你准备的舒适餐
                  <span className="text-sm font-bold bg-primary/20 text-primary px-4 py-1.5 rounded-full border border-primary/10">
                    3步搞定
                  </span>
                </h3>
                <div className="flex gap-3 text-[#757b6f]">
                  <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-2xl">
                    grid_view
                  </span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-2xl">
                    list
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
                {recipes.map((recipe, index) => {
                  const rotations = ['-1deg', '2deg', '-0.5deg', '1.2deg', '-2deg', '1deg'];
                  const rotation = rotations[index % rotations.length];
                  const needCount = recipe.ingredients.filter((i) => i.status === '需补充').length;
                  const recipeImg = getRecipeImage(recipe.name);

                  return (
                    <div
                      key={index}
                      className="polaroid bg-white dark:bg-[#22261d] p-5 pb-10 border border-gray-100 dark:border-white/5 relative"
                      style={{ transform: `rotate(${rotation})` }}
                    >
                      <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 z-10 opacity-80"></div>
                      <div className={`w-full aspect-[4/3] bg-gradient-to-br ${recipeImg.gradient} rounded-sm mb-5 shadow-inner flex items-center justify-center`}>
                        <span className="text-7xl drop-shadow-md">{recipeImg.emoji}</span>
                      </div>
                      <div className="space-y-3">
                        <p className="text-2xl font-black text-[#2c3327]">{recipe.name}</p>
                        {/* 食材列表（带图标） */}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.ingredients.map((ing, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                  ing.status === '需补充'
                                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                    : 'bg-green-50 text-green-600 border border-green-200'
                                }`}
                              >
                                <span>{getIngredientIcon(ing.name)}</span>
                                {ing.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs font-bold text-[#757b6f]">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-sm">stairs</span>
                            {recipe.steps.length}步烹饪
                          </span>
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {recipe.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed border-[#e0e2df] dark:border-white/10">
                          {needCount === 0 ? (
                            <>
                              <span className="material-symbols-outlined text-primary text-lg">
                                verified
                              </span>
                              <p className="text-xs font-bold text-primary">食材已备齐! ✨</p>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-orange-400 text-lg">
                                sentiment_dissatisfied
                              </span>
                              <p className="text-xs font-bold text-orange-600">
                                缺少{needCount}样食材
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white dark:bg-[#22261d] border-l border-[#e0e2df] dark:border-white/10 p-6 flex-col gap-6 hidden xl:flex">
        {/* Missing Ingredients */}
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
            <h4 className="font-black text-lg">缺少的食材</h4>
          </div>
          <ul className="space-y-4">
            {recipes.flatMap(r => r.ingredients.filter((i) => i.status === '需补充')).slice(0, 4).map((ing, idx) => (
              <li key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getIngredientIcon(ing.name)}</span>
                  <span className="font-bold">{ing.name} ({ing.quantity || '适量'})</span>
                </div>
                <button className="bg-soft-pink text-pink-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-soft-pink/80 transition-colors">
                  添加
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Cloudy Tips */}
        <div className="mt-auto">
          <div className="bg-sky-blue/30 rounded-3xl p-8 relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="size-20 bg-white rounded-full flex items-center justify-center border-4 border-sky-blue/50 shadow-xl">
                <span className="material-symbols-outlined text-primary text-5xl">cloudy</span>
              </div>
            </div>
            <div className="pt-8 text-center">
              <p className="font-black text-xl mb-3 text-primary">Cloudy 的小贴士</p>
              <p className="text-sm text-[#757b6f] font-bold italic leading-relaxed">
                "累的时候，试试一锅出料理，这样吃完就不用洗那么多碗啦！"
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
