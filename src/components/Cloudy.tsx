/**
 * Cloudy Mascot Component
 * Cloudy 吉祥物提示组件
 */

interface CloudyProps {
  message: string;
  mood?: 'happy' | 'thinking' | 'excited';
}

export default function Cloudy({ message, mood = 'happy' }: CloudyProps) {
  const getMoodEmoji = () => {
    switch (mood) {
      case 'thinking':
        return '🤔';
      case 'excited':
        return '🎉';
      default:
        return '😊';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-2xl p-6 shadow-sm">
      {/* Cloudy 头像 */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-4xl">{getMoodEmoji()}</span>
        </div>
      </div>

      {/* Cloudy 名字 */}
      <h3 className="text-center text-lg font-bold text-pink-600 mb-3">
        Cloudy 说：
      </h3>

      {/* 提示消息 */}
      <p className="text-center text-gray-700 leading-relaxed">
        {message}
      </p>
    </div>
  );
}
