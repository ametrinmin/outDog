
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ push: true, vibrate: true, likes: true, comments: true, system: false });

  const toggle = (key: keyof typeof settings) => { setSettings(prev => ({ ...prev, [key]: !prev[key] })); };

  const sections = [
    { title: '通知方式', items: [{ label: '接收新消息通知', key: 'push' as const }, { label: '震动提示', key: 'vibrate' as const }] },
    { title: '消息类型', items: [{ label: '点赞提醒', key: 'likes' as const }, { label: '回复提醒', key: 'comments' as const }, { label: '系统通知', key: 'system' as const }] }
  ];

  return (
    <div className="bg-background-light dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors">
      <header className="px-5 py-3 bg-white dark:bg-slate-900 sticky top-0 z-40 flex items-center border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-slate-600 dark:text-white">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold text-slate-900 dark:text-white tracking-tight">通知设置</h1>
      </header>

      <main className="p-5 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-2 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{section.title}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 divide-y dark:divide-slate-800">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 px-5">
                  <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                  <button 
                    onClick={() => toggle(item.key)}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings[item.key] ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings[item.key] ? 'left-7 bg-white dark:bg-slate-900' : 'left-1 bg-white dark:bg-slate-600'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default NotificationSettings;
