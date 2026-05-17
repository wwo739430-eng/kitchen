/**
 * Sidebar Component
 * 左侧导航栏 - 基于 UI 设计的拍立得风格
 */
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/ingredients', label: '我的食材', icon: 'shopping_basket' },
  { path: '/favorites', label: '收藏夹', icon: 'favorite' },
  { path: '/shopping-list', label: '购物清单', icon: 'receipt_long' },
  { path: '/settings', label: '设置', icon: 'settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 bg-white dark:bg-[#22261d] border-r border-[#e0e2df] dark:border-white/10 flex flex-col p-6 m-4 rounded-xl shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="relative size-12 bg-sky-blue rounded-full flex items-center justify-center border-2 border-primary/20">
          <span className="material-symbols-outlined text-primary text-3xl">cloudy_snowing</span>
          <div className="absolute -top-2 -right-2 bg-primary rounded-full px-1 border-2 border-white">
            <span className="material-symbols-outlined text-white text-[10px]">restaurant</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-primary">心情厨房 AI</h1>
          <p className="text-[#757b6f] text-xs font-bold tracking-wider">Cloudy 正在烹饪!</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 grow">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className={`font-bold ${isActive ? '' : 'text-[#555]'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Generate Button */}
      <button className="w-full bg-primary text-white rounded-full py-4 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 mt-auto flex items-center justify-center gap-2">
        <span className="material-symbols-outlined">add_circle</span>
        生成新食谱
      </button>
    </aside>
  );
}
