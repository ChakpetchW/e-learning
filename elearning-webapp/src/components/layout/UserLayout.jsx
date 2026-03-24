import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Gift, User, BookMarked, LogOut, CheckCircle } from 'lucide-react';
import { userAPI } from '../../utils/api';
import './UserLayout.css';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
        const res = await userAPI.getPoints();
        setPoints(res.data.balance || 0);
      } catch (err) {
        console.error("Failed to fetch user points");
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
      
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-[280px] flex-col bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-100/80 my-5 ml-5 h-[calc(100vh-2.5rem)] z-20 overflow-hidden shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <BookMarked size={20} strokeWidth={2.5}/>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">LMS Connect</h1>
        </div>
        
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="points-pill w-full flex justify-center !py-2.5">
            <Gift size={16} strokeWidth={3} />
            <span className="text-sm">{points.toLocaleString()} Pts</span>
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">ผู้ใช้งาน</p>
            <p className="font-bold text-sm text-gray-800 truncate">{user?.name || 'Loading...'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          <NavLink to="/user/home" className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${isActive ? 'bg-primary-light/60 text-primary shadow-[0_2px_10px_-2px_rgba(79,70,229,0.1)] border border-primary/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group-hover:scale-105'}`}>
            <Home size={20} /> <span>หน้าแรก</span>
          </NavLink>
          
          <NavLink to="/user/courses" className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${isActive ? 'bg-primary-light/60 text-primary shadow-[0_2px_10px_-2px_rgba(79,70,229,0.1)] border border-primary/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group-hover:scale-105'}`}>
            <BookOpen size={20} /> <span>คอร์สเรียน</span>
          </NavLink>
          
          <NavLink to="/user/completed" className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${isActive ? 'bg-primary-light/60 text-primary shadow-[0_2px_10px_-2px_rgba(79,70,229,0.1)] border border-primary/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group-hover:scale-105'}`}>
            <CheckCircle size={20} /> <span>คอร์สที่เรียนจบแล้ว</span>
          </NavLink>
          
          <NavLink to="/user/rewards" className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${isActive ? 'bg-primary-light/60 text-primary shadow-[0_2px_10px_-2px_rgba(79,70,229,0.1)] border border-primary/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group-hover:scale-105'}`}>
            <Gift size={20} /> <span>ของรางวัล</span>
          </NavLink>
          
          <NavLink to="/user/profile" className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${isActive ? 'bg-primary-light/60 text-primary shadow-[0_2px_10px_-2px_rgba(79,70,229,0.1)] border border-primary/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group-hover:scale-105'}`}>
            <User size={20} /> <span>โปรไฟล์</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 w-full transition-colors border border-transparent hover:border-red-100">
            <LogOut size={18} /> <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header (Mobile Only) */}
        <header className="user-header md:hidden">
          <div className="header-content pt-1">
            <div className="flex items-center gap-2 max-w-[65%]">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                <BookMarked size={20} strokeWidth={2.5}/>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none truncate">LMS Connect</h1>
                {location.pathname !== '/user/home' && (
                  <span className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                    สวัสดีคุณ {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'}
                  </span>
                )}
              </div>
            </div>
            <div className="points-pill shrink-0 shadow-sm border border-orange-100/50">
              <Gift size={12} strokeWidth={3} />
              <span className="font-extrabold">{points.toLocaleString()} Pts</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="user-main flex-1 no-scrollbar md:!max-w-[1400px] md:mx-auto md:!px-12 md:!pt-12 md:!pb-12 bg-transparent w-full">
          <Outlet />
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="bottom-nav md:hidden">
          <div className="nav-items-container">
            <NavLink to="/user/home" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon-wrapper"><Home size={22} /></div>
              <span>หน้าแรก</span>
            </NavLink>
            
            <NavLink to="/user/courses" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon-wrapper"><BookOpen size={22} /></div>
              <span>คอร์สเรียน</span>
            </NavLink>

            <NavLink to="/user/completed" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon-wrapper"><CheckCircle size={22} /></div>
              <span>จบแล้ว</span>
            </NavLink>
            
            <NavLink to="/user/rewards" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon-wrapper"><Gift size={22} /></div>
              <span>ของรางวัล</span>
            </NavLink>
            
            <NavLink to="/user/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon-wrapper"><User size={22} /></div>
              <span>โปรไฟล์</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default UserLayout;
