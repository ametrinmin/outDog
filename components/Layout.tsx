
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: '/', icon: 'forum', label: '社区' },
    { key: '/messages', icon: 'chat_bubble_outline', label: '消息' },
    { key: '/publish', icon: 'add', label: '发布', isSpecial: true },
    { key: '/shop', icon: 'shopping_bag', label: '周边' },
    { key: '/profile', icon: 'person_outline', label: '我的' },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  // Hide bottom nav on specific pages if needed (like individual chat room)
  const isChatRoom = location.pathname.startsWith('/chat/');

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light shadow-2xl flex flex-col relative overflow-hidden">
      <div className="flex-1 pb-24">
        {children}
      </div>

      {!isChatRoom && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 px-6 py-2 pb-5 flex justify-between items-end z-50 backdrop-blur-lg">
          {navItems.map((item) => (
            item.isSpecial ? (
              <div key={item.key} className="relative -top-5">
                <button 
                  onClick={() => navigate('/publish')}
                  className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-slate-300 transition active:scale-95"
                >
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </button>
              </div>
            ) : (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex flex-col items-center gap-1 transition w-12 ${
                  isActive(item.key) ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${isActive(item.key) ? 'FILL-1' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] ${isActive(item.key) ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            )
          ))}
        </nav>
      )}
      
      <style>{`
        .FILL-1 { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
};

export default Layout;
