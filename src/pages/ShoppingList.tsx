/**
 * Shopping List Page
 * 购物清单页面
 */
export default function ShoppingList() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">购物清单 📋</h1>
        <p className="text-gray-600 mb-8">需要补充的食材清单</p>

        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500">购物清单是空的，生成食谱后会自动添加需要购买的食材</p>
        </div>
      </div>
    </div>
  );
}
