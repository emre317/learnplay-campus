import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Grade from './pages/Grade.jsx';
import Topic from './pages/Topic.jsx';
import Quiz from './pages/Quiz.jsx';
import Games from './pages/Games.jsx';
import GamePlay from './pages/GamePlay.jsx';
import Pricing from './pages/Pricing.jsx';
import Progress from './pages/Progress.jsx';
import Parent from './pages/Parent.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { pathname } = useLocation();
  const bare = pathname === '/giris' || pathname === '/kayit';
  return (
    <div className="flex min-h-screen flex-col">
      {!bare && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/kayit" element={<Register />} />
          <Route path="/premium" element={<Pricing />} />
          <Route path="/sinif/:grade" element={<Grade />} />
          <Route path="/konu/:slug" element={<Topic />} />
          <Route path="/oyunlar" element={<Games />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<Dashboard />} />
            <Route path="/konu/:slug/:mode" element={<Quiz />} />
            <Route path="/oyunlar/:key" element={<GamePlay />} />
            <Route path="/gelisim" element={<Progress />} />
          </Route>
          <Route element={<ProtectedRoute roles={['parent', 'admin']} />}>
            <Route path="/veli" element={<Parent />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/yonetim" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!bare && <Footer />}
    </div>
  );
}
