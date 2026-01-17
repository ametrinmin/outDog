
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../constants';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(CURRENT_USER);

  useEffect(() => {
    const savedUser = localStorage.getItem('outdog_user_info');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile', { replace: true });
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出当前账号吗？')) {
      localStorage.removeItem('outdog_user_info');
      localStorage.removeItem('outdog_user_phone');
      alert('已安全退出登录');
      navigate('/');
      window.location.reload();
    }
  };

  const menuItems = [
    { label: '账号与安全', path: '/settings/account', extra: null },
    { label: '通知设置', path: '/settings/notifications', extra: null },
    { label: '关于 OUTDOG', path: null, extra: 'v1.2.0' },
  ];

  return (
    <div className="bg-background-light dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors">
      <header className="px-5 py-3 bg-white dark:bg-slate-900 sticky top-0 z-[60] backdrop-blur-md flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full text-slate-600 dark:text-white active:scale-90 active:bg-slate-100 dark:active:bg-slate-800 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold text-slate-900 dark:text-white tracking-tight">设置中心</h1>
      </header>

      <main className="px-5 pt-6 space-y-8">
        <section 
          onClick={() => navigate('/settings/edit-profile')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800 transition cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-950">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">编辑个人资料</p>
          </div>
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">chevron_right</span>
        </section>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden divide-y dark:divide-slate-800">
          {menuItems.map((item, i) => (
            <button 
              key={i} 
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center justify-between p-4 pl-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.extra && <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{item.extra}</span>}
                {item.path && <span className="material-symbols-outlined text-slate-300 dark:text-slate-700" style={{ fontSize: '20px' }}>chevron_right</span>}
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[16px] shadow-lg active:scale-95 transition-all"
        >
          退出登录
        </button>
      </main>
    </div>
  );
};

export default Settings;
