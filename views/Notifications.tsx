
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_NOTIFICATIONS } from '../constants';
import { Notification } from '../types';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  // 使用 state 管理通知列表，实现实时 UI 反馈
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

  // 一键已读功能
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    // 同时更新原始数据，保持全局状态同步
    MOCK_NOTIFICATIONS.forEach((n, idx) => {
      MOCK_NOTIFICATIONS[idx].isRead = true;
    });
  };

  // 处理通知点击
  const handleNotifClick = (notifId: string, relatedId?: string) => {
    // 1. 更新已读状态
    const updated = notifications.map(n => {
      if (n.id === notifId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    setNotifications(updated);
    
    // 同步修改原始 Mock 数据
    const targetIdx = MOCK_NOTIFICATIONS.findIndex(n => n.id === notifId);
    if (targetIdx !== -1) {
      MOCK_NOTIFICATIONS[targetIdx].isRead = true;
    }

    // 2. 跳转逻辑
    if (relatedId) {
      // 延迟极短时间跳转，让用户能感知到点击反馈
      setTimeout(() => {
        navigate(`/post/${relatedId}`);
      }, 50);
    }
  };

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-300">
      <header className="px-5 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 text-slate-400">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">提醒中心</h1>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="text-blue-500 text-xs font-bold active:opacity-60 transition-opacity"
        >
          一键已读
        </button>
      </header>

      <div className="flex border-b border-slate-50 sticky top-[61px] z-40 bg-white">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 rounded-full animate-in zoom-in-50"></span>
            )}
          </button>
        ))}
      </div>

      <main className="divide-y divide-slate-50">
        {filteredNotifications.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => handleNotifClick(notif.id, notif.relatedId)}
            className={`px-5 py-4 flex gap-4 active:bg-slate-50 transition-colors cursor-pointer ${notif.isRead ? 'bg-white/50' : 'bg-slate-50/20'}`}
          >
            <div className="relative shrink-0">
              <div className={`w-12 h-12 rounded-full overflow-hidden border border-slate-100 bg-slate-50 ${notif.isRead ? 'grayscale-[0.5] opacity-80' : ''}`}>
                <img src={notif.sender.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -right-1 -bottom-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-white ${
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
                <h3 className={`text-sm font-bold ${notif.isRead ? 'text-slate-500' : 'text-slate-900'}`}>{notif.sender.name}</h3>
                <span className="text-[10px] text-slate-400 font-medium">{notif.timestamp}</span>
              </div>
              <p className={`text-sm leading-relaxed line-clamp-2 ${notif.isRead ? 'text-slate-400' : 'text-slate-700'}`}>
                {notif.content}
              </p>
            </div>
            
            {/* 未读红点提示 */}
            {!notif.isRead && (
              <div className="shrink-0 pt-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-sm shadow-blue-200"></div>
              </div>
            )}
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="py-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-slate-200 text-4xl">notifications_off</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">暂时没有相关提醒</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
