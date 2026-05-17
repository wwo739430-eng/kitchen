/**
 * IngredientCard Component
 * 食材卡片组件
 */
import type { Ingredient } from '../services/api';

interface IngredientCardProps {
  ingredient: Ingredient;
  onQuantityChange?: (id: number, delta: number) => void;
  onDelete?: (id: number) => void;
}

export default function IngredientCard({ ingredient, onQuantityChange, onDelete: _onDelete }: IngredientCardProps) {
  const handleIncrease = () => {
    if (ingredient.id && onQuantityChange) {
      onQuantityChange(ingredient.id, 1);
    }
  };

  const handleDecrease = () => {
    if (ingredient.id && onQuantityChange) {
      onQuantityChange(ingredient.id, -1);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 食材图片占位 */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
        <span className="text-4xl">🥬</span>
      </div>

      {/* 食材名称 */}
      <h4 className="text-center font-medium text-gray-800 mb-2">{ingredient.name}</h4>

      {/* 数量控制 */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleDecrease}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
        >
          <span className="text-gray-600">−</span>
        </button>
        <span className="text-lg font-medium text-primary-600 min-w-[60px] text-center">
          {ingredient.quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
        >
          <span>+</span>
        </button>
      </div>
    </div>
  );
}
