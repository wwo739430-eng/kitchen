import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Settings from './pages/Settings';
import MyIngredients from './pages/MyIngredients';
import Favorites from './pages/Favorites';
import ShoppingList from './pages/ShoppingList';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#fdfdfb] doodle-bg">
        {/* 左侧导航 */}
        <Sidebar />

        {/* 主内容区 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ingredients" element={<MyIngredients />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
