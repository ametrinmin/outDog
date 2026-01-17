
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MOCK_CHATS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 模拟全局未读消息统计
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    const calculateUnread = () => {
      const total = MOCK_CHATS.reduce((sum, chat) => sum + chat.unreadCount, 0);
      setUnreadTotal(total);
    };
    calculateUnread();
    
    // 监听 storage 事件或页面切换来刷新计数
    window.addEventListener('storage', calculateUnread);
    const interval = setInterval(calculateUnread, 1000); // 轮询模拟实时
    return () => {
      window.removeEventListener('storage', calculateUnread);
      clearInterval(interval);
    };
  }, [location.pathname]);

  const navItems = [
    { key: '/', icon: 'forum', label: '社区' },
    { key: '/messages', icon: 'chat_bubble_outline', label: '消息', badge: unreadTotal },
    { key: '/publish', icon: 'add', label: '发布', isSpecial: true },
    { key: '/shop', icon: 'shopping_bag', label: '周边' },
    { key: '/profile', icon: 'person_outline', label: '我的' },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  const hideNavPaths = ['/chat/', '/cart', '/checkout', '/product/', '/order/'];
  const shouldHideNav = hideNavPaths.some(p => location.pathname.startsWith(p));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-slate-950 shadow-2xl flex flex-col relative overflow-hidden transition-colors">
      <div className={`flex-1 ${shouldHideNav ? 'pb-0' : 'pb-24'}`}>
        {children}
      </div>

      {!shouldHideNav && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 px-6 py-2 pb-5 flex justify-between items-end z-50 backdrop-blur-lg transition-colors">
          {navItems.map((item) => (
            item.isSpecial ? (
              <div key={item.key} className="relative -top-5">
                <button 
                  onClick={() => navigate('/publish')}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-slate-300 dark:shadow-none transition active:scale-95"
                >
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </button>
              </div>
            ) : (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex flex-col items-center gap-1 transition relative w-12 ${
                  isActive(item.key) ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${isActive(item.key) ? 'FILL-1' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] ${isActive(item.key) ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                
                {/* 底部 Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
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
