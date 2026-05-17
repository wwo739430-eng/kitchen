/**
 * My Ingredients Page
 * 我的食材页面 - 拍立得风格
 */
import { useState, useEffect } from 'react';
import { ingredientAPI, type Ingredient } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getIngredientIcon } from '../utils/ingredientIcons';
export default function MyIngredients() {
  const [ingredients, setIngredients] = useState<{
    fridge: Ingredient[];
    freezer: Ingredient[];
    pantry: Ingredient[];
  }>({
    fridge: [],
    freezer: [],
    pantry: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    loadIngredients();
  }, []);

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">
            refresh
          </span>
          <p className="text-gray-600 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  const IngredientCard = ({ ingredient, rotation }: { ingredient: Ingredient; rotation: string }) => (
    <div
      className="polaroid bg-white dark:bg-[#22261d] p-4 pb-6 border border-gray-100 dark:border-white/5 relative"
      style={{ transform: `rotate(${rotation})` }}
    >
      <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 z-10 opacity-70"></div>
      <div className="w-full aspect-square bg-gradient-to-br from-primary/10 to-primary/20 rounded-sm mb-4 shadow-inner flex items-center justify-center">
        <span className="text-5xl">{getIngredientIcon(ingredient.name, ingredient.category)}</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg font-black text-[#2c3327]">{ingredient.name}</p>
        <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-white/5 rounded-full px-2 py-1">
          <button className="size-8 rounded-full bg-white dark:bg-[#2c3327] text-primary shadow-sm hover:scale-110 transition-transform flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="font-black text-primary">
           {(ingredient.quantity || '').split(/(\d+)/)[1] || ''}{' '}
           <small className="text-[10px]">{(ingredient.quantity || '').replace(/\d+/g, '')}</small>
          </span>
          <button className="size-8 rounded-full bg-primary text-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>
    </div>
  );

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
            <button className="px-6 py-2.5 rounded-full bg-white dark:bg-[#22261d] text-primary font-black text-sm border-2 border-primary/20 hover:border-primary transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_alt</span> 筛选
            </button>
            <button onClick={() => navigate('/scan')} className="px-6 py-2.5 rounded-full bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">document_scanner</span>
              扫描小票入库
            </button>
          </div>
        </div>

        {/* Fridge Section */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-sky-blue rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">ac_unit</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">冷藏 (Fridge)</h3>
            <div className="h-px bg-gray-200 grow ml-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {ingredients.fridge.map((ing, index) => {
              const rotations = ['-1.5deg', '1deg', '-0.5deg', '2deg'];
              return (
                <IngredientCard
                  key={ing.id}
                  ingredient={ing}
                  rotation={rotations[index % rotations.length]}
                />
              );
            })}
          </div>
        </section>

        {/* Freezer Section */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">severe_cold</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">冷冻 (Freezer)</h3>
            <div className="h-px bg-gray-200 grow ml-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {ingredients.freezer.map((ing, index) => {
              const rotations = ['1.5deg', '-1deg', '0.5deg', '-2deg'];
              return (
                <IngredientCard
                  key={ing.id}
                  ingredient={ing}
                  rotation={rotations[index % rotations.length]}
                />
              );
            })}
          </div>
        </section>

        {/* Pantry Section */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-orange-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600">inventory_2</span>
            </div>
            <h3 className="text-2xl font-black text-[#2c3327]">常温 (Pantry)</h3>
            <div className="h-px bg-gray-200 grow ml-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {ingredients.pantry.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-8">暂无常温食材</p>
            ) : (
              ingredients.pantry.map((ing, index) => {
                const rotations = ['-1deg', '1.5deg', '-0.5deg', '2deg'];
                return (
                  <IngredientCard
                    key={ing.id}
                    ingredient={ing}
                    rotation={rotations[index % rotations.length]}
                  />
                );
              })
            )}
          </div>
        </section>

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
    </main>
  );
}
