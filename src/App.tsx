/**
 * Main App Component
 * 应用主入口，配置路由
 */
import ScanReceipt from './pages/ScanReceipt';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import MyIngredients from './pages/MyIngredients';
import Favorites from './pages/Favorites';
import ShoppingList from './pages/ShoppingList';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-[#141513] dark:text-white doodle-bg">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ingredients" element={<MyIngredients />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/scan" element={<ScanReceipt />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
