
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CHATS, CURRENT_USER } from '../constants';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  // 使用 state 管理，以便点击后能立即看到红点消失的效果
  const [chatList, setChatList] = useState([...MOCK_CHATS]);

  const handleUserClick = (e: React.MouseEvent, userName?: string) => {
    e.stopPropagation();
    if (userName === CURRENT_USER.name) {
      navigate('/profile');
    } else {
      navigate(`/user/${userName}`);
    }
  };

  const handleChatClick = (id: string) => {
    // 1. 在本地内存中将该会话的未读数清零
    const updatedChats = chatList.map(chat => {
      if (chat.id === id) {
        // 同步修改原始数据，保证全局一致
        const originalChat = MOCK_CHATS.find(c => c.id === id);
        if (originalChat) originalChat.unreadCount = 0;
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    });
    setChatList(updatedChats);
    
    // 2. 跳转到聊天室
    navigate(`/chat/${id}`);
  };

  const markAllRead = () => {
    const updatedChats = chatList.map(chat => {
      const originalChat = MOCK_CHATS.find(c => c.id === chat.id);
      if (originalChat) originalChat.unreadCount = 0;
      return { ...chat, unreadCount: 0 };
    });
    setChatList(updatedChats);
  };

  return (
    <div className="animate-in fade-in duration-500 bg-white dark:bg-slate-950 min-h-screen transition-colors">
      <header className="px-5 py-4 sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex justify-between items-center border-b border-slate-50 dark:border-slate-800 transition-colors">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">消息列表</h1>
        <div className="flex gap-4">
          <button onClick={markAllRead} className="text-blue-500 dark:text-blue-400 text-xs font-bold active:opacity-60 transition-opacity">一键已读</button>
        </div>
      </header>

      <main className="divide-y divide-slate-50 dark:divide-slate-900 transition-colors">
        {chatList.map((chat) => (
          <div 
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className="flex items-center gap-4 px-5 py-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors cursor-pointer group"
          >
            <div className="relative flex-shrink-0">
              <div 
                className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer active:scale-95 transition"
                onClick={(e) => handleUserClick(e, chat.participant.name!)}
              >
                <img src={chat.participant.avatar} alt={chat.participant.name} className="w-full h-full object-cover" />
              </div>
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-950 animate-bounce">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white truncate">{chat.participant.name}</h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{chat.timestamp}</span>
              </div>
              <p className={`text-sm truncate leading-snug ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-slate-200 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))}
        
        {chatList.length === 0 && (
          <div className="py-20 text-center">
            <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl">mail_outline</span>
            </div>
            <p className="text-slate-400 dark:text-slate-600 text-sm">暂无新消息</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
