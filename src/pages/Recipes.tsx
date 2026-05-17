import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recipeAPI, type Recipe } from '../services/api';

export default function Recipes() {
  const { state } = useLocation();
  const initial: Recipe[] = state?.recipes ?? [];
  const [recipes, setRecipes] = useState<Recipe[]>(initial);
  const [loading, setLoading] = useState(initial.length === 0);
  const navigate = useNavigate();

  useEffect(() => {
    if (initial.length === 0) {
      (async () => {
        try {
          const resp = await recipeAPI.getHistory(20);
          setRecipes(resp.recipes || []);
        } catch (e) {
          console.error('加载食谱历史失败', e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  if (loading) return <main className="p-8">加载中...</main>;
  if (recipes.length === 0) return <main className="p-8">暂无食谱</main>;

  return (
    <main className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">生成的食谱</h1>
          <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">返回</button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {recipes.map((r, i) => (
            <div key={i} className="p-4 border rounded">
              <p className="text-lg font-bold">{r.name}</p>
              <p className="text-sm text-gray-600">{r.time} · {r.steps.length}步</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
