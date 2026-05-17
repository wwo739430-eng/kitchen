/**
 * Favorites Page
 * 收藏夹页面
 */
export default function Favorites() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">收藏夹 ❤️</h1>
        <p className="text-gray-600 mb-8">你收藏的美味食谱都在这里</p>

        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500">暂无收藏，快去发现喜欢的食谱吧！</p>
        </div>
      </div>
    </div>
  );
}
