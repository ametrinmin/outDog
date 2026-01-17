
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_NOTIFICATIONS, CURRENT_USER } from '../constants';
import { Notification } from '../types';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([...MOCK_NOTIFICATIONS]);
  const [activeTab, setActiveTab] = useState<'all' | 'like' | 'comment' | 'system'>('all');

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'all' || n.type === activeTab || (activeTab === 'comment' && n.type === 'mention')
  );

  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'like', label: '点赞' },
    { id: 'comment', label: '回复' },
    { id: 'system', label: '系统' },
  ];

  const handleUserClick = (e: React.MouseEvent, userName?: string) => {
    e.stopPropagation();
    if (userName === CURRENT_USER.name) navigate('/profile'); else navigate(`/user/${userName}`);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    MOCK_NOTIFICATIONS.forEach((n, idx) => { MOCK_NOTIFICATIONS[idx].isRead = true; });
  };

  const handleNotifClick = (notifId: string, relatedId?: string, commentId?: string) => {
    // 标记为已读
    const updated = notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n);
    setNotifications(updated);
    
    const targetIdx = MOCK_NOTIFICATIONS.findIndex(n => n.id === notifId);
    if (targetIdx !== -1) MOCK_NOTIFICATIONS[targetIdx].isRead = true;

    if (relatedId) {
      // 核心交互：根据 commentId 生成锚点路径
      const path = commentId ? `/post/${relatedId}#comment-${commentId}` : `/post/${relatedId}`;
      navigate(path);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen animate-in fade-in duration-300 transition-colors">
      <header className="px-5 py-4 sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 text-slate-400 dark:text-white">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">提醒中心</h1>
        </div>
        <button onClick={handleMarkAllRead} className="text-blue-500 dark:text-blue-400 text-xs font-bold active:opacity-60">一键已读</button>
      </header>

      <div className="flex border-b border-slate-50 dark:border-slate-900 sticky top-[61px] z-40 bg-white dark:bg-slate-900 transition-colors">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 dark:bg-white rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      <main className="divide-y divide-slate-50 dark:divide-slate-900">
        {filteredNotifications.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => handleNotifClick(notif.id, notif.relatedId, notif.commentId)}
            className={`px-5 py-4 flex gap-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors cursor-pointer ${notif.isRead ? 'bg-white dark:bg-slate-950/50' : 'bg-slate-50/20 dark:bg-slate-900/20'}`}
          >
            <div className="relative shrink-0">
              <div 
                className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                onClick={(e) => handleUserClick(e, notif.sender.name)}
              >
                <img src={notif.sender.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -right-1 -bottom-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 text-white ${
                notif.type === 'like' ? 'bg-red-500' : 
                notif.type === 'comment' ? 'bg-blue-500' : 
                notif.type === 'mention' ? 'bg-indigo-500' : 'bg-slate-800'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {notif.type === 'like' ? 'favorite' : 
                   notif.type === 'comment' ? 'chat' : 
                   notif.type === 'mention' ? 'alternate_email' : 'notifications'}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`text-sm font-bold ${notif.isRead ? 'text-slate-500 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>{notif.sender.name}</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-600">{notif.timestamp}</span>
              </div>
              <p className={`text-sm leading-relaxed line-clamp-2 ${notif.isRead ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
                {notif.content}
              </p>
            </div>
            {!notif.isRead && (
              <div className="shrink-0 pt-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className="py-20 text-center text-slate-400">
             <p className="text-sm font-medium">暂无此类通知</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
