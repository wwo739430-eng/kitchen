/**
 * Settings Page
 * 设置页面
 */

export default function Settings() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">设置 ⚙️</h1>
        <p className="text-gray-600 mb-8">个性化你的烹饪体验</p>

        <div className="bg-white rounded-xl p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">偏好设置</h3>
              <p className="text-sm text-gray-600">设置你的饮食偏好和限制</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">关于</h3>
              <p className="text-sm text-gray-600">SmartCook AI v1.0</p>
              <p className="text-sm text-gray-600 mt-2">让 AI 帮你解决"今天吃什么"的难题</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
