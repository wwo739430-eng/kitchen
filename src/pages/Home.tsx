/**
 * Home Page
 * 首页 - 拍立得风格的食谱推荐
 */
import { useState } from 'react';
import { recipeAPI, type Recipe, type Ingredient } from '../services/api';

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
      alert('生成食谱失败，请检查后端服务是否启动');
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

                  return (
                    <div
                      key={index}
                      className="polaroid bg-white dark:bg-[#22261d] p-5 pb-10 border border-gray-100 dark:border-white/5 relative"
                      style={{ transform: `rotate(${rotation})` }}
                    >
                      <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 z-10 opacity-80"></div>
                      <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/30 rounded-sm mb-5 shadow-inner flex items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                      </div>
                      <div className="space-y-3">
                        <p className="text-2xl font-black text-[#2c3327]">{recipe.name}</p>
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
            <li className="flex items-center justify-between text-sm bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-xl">
                  sentiment_dissatisfied
                </span>
                <span className="font-bold">黄洋葱 (2个)</span>
              </div>
              <button className="bg-soft-pink text-pink-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-soft-pink/80 transition-colors">
                添加
              </button>
            </li>
            <li className="flex items-center justify-between text-sm bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-xl">
                  sentiment_dissatisfied
                </span>
                <span className="font-bold">寿司海苔 (1包)</span>
              </div>
              <button className="bg-soft-pink text-pink-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-soft-pink/80 transition-colors">
                添加
              </button>
            </li>
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
