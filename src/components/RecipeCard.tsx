/**
 * RecipeCard Component
 * 食谱卡片组件
 */
import type { Recipe } from '../services/api';

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails?: () => void;
  onFavorite?: () => void;
}

export default function RecipeCard({ recipe, onViewDetails, onFavorite }: RecipeCardProps) {
  // 统计需补充的食材
  const needCount = recipe.ingredients.filter(i => i.status === '需补充').length;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* 食谱图片占位 */}
      <div className="h-48 bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
        <span className="text-6xl">🍽️</span>
      </div>

      {/* 食谱信息 */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
            {recipe.difficulty}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
            <span>⏱️</span>
            {recipe.time}
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
            <span>🔥</span>
            {recipe.calories}
          </span>
        </div>

        {/* 食材状态 */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-green-600">✓</span>
            <span className="text-gray-600">食材已备齐</span>
          </div>
          {needCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-orange-500">⚠️</span>
              <span className="text-gray-600">缺少 {needCount} 样食材</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            查看详情
          </button>
          <button
            onClick={onFavorite}
            className="px-4 py-2 border border-gray-300 hover:border-primary-500 hover:text-primary-500 rounded-lg transition-colors"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}
