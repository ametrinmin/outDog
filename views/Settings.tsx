
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../constants';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: '账号与安全', extra: null },
    { label: '通知设置', extra: null },
    { label: '隐私设置', extra: null },
    { label: '清除缓存', extra: '128 MB' },
    { label: '关于 OUTDOG', extra: 'v1.2.0' },
  ];

  return (
    <div className="bg-background-light min-h-screen animate-in slide-in-from-right duration-300 flex flex-col">
      <header className="px-5 py-3 bg-white sticky top-0 z-40 backdrop-blur-md flex items-center border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-slate-600 hover:bg-slate-100 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold text-slate-900 tracking-tight">设置中心</h1>
      </header>

      <main className="flex-1 px-5 pt-6 space-y-8">
        <section className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition cursor-pointer group">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100">
              <img src={CURRENT_USER.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-1 border-2 border-white w-6 h-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px]">edit</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">{CURRENT_USER.name}</h2>
            <p className="text-sm text-slate-500 truncate mt-0.5">{CURRENT_USER.bio}</p>
          </div>
          <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500">chevron_right</span>
        </section>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden divide-y divide-slate-50">
          {menuItems.map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 pl-5 hover:bg-slate-50 transition group">
              <span className="text-[15px] font-bold text-slate-800 group-hover:text-slate-900">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.extra && <span className="text-xs font-medium text-slate-400">{item.extra}</span>}
                <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500" style={{ fontSize: '20px' }}>chevron_right</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4">
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-[16px] shadow-lg shadow-slate-200 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            退出登录
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
