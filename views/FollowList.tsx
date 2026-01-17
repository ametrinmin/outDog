
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../constants';

const MOCK_USERS_BASE = [
  { id: 'u101', name: '龙华小周', bio: '电子厂资深打工人', avatar: 'https://picsum.photos/seed/u101/100', isFollowing: true },
  { id: 'u102', name: '长安强哥', bio: '水电维修专家，专治疑难杂症', avatar: 'https://picsum.photos/seed/u102/100', isFollowing: false },
  { id: 'u103', name: '厂妹小丽', bio: '分享日常生活，寻找志同道合的朋友', avatar: 'https://picsum.photos/seed/u103/100', isFollowing: true },
  { id: 'u104', name: '老师傅老李', bio: '三十年木工经验，欢迎交流', avatar: 'https://picsum.photos/seed/u104/100', isFollowing: false },
  { id: 'u105', name: '深漂小赵', bio: '梦想在深圳买房的奋斗者', avatar: 'https://picsum.photos/seed/u105/100', isFollowing: true },
];

const FollowList: React.FC = () => {
  const { type, name } = useParams<{ type: 'following' | 'followers', name?: string }>();
  const navigate = useNavigate();
  
  // 如果是看别人的列表，稍微随机化一下数据模拟真实感
  const initialUsers = useMemo(() => {
    if (!name || name === CURRENT_USER.name) return MOCK_USERS_BASE;
    // 随机混淆一下关注状态
    return MOCK_USERS_BASE.map(u => ({
      ...u,
      isFollowing: Math.random() > 0.5
    }));
  }, [name]);

  const [users, setUsers] = useState(initialUsers);

  const toggleFollow = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        return { ...user, isFollowing: !user.isFollowing };
      }
      return user;
    }));
  };

  const handleUserClick = (userName: string) => {
    if (userName === CURRENT_USER.name) {
      navigate('/profile');
    } else {
      navigate(`/user/${userName}`);
    }
  };

  const typeLabel = type === 'following' ? '关注' : '粉丝';
  const title = name ? `${name} 的${typeLabel}` : `我的${typeLabel}`;

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors">
      <header className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-4">{title}</h1>
      </header>

      <main className="divide-y divide-slate-100 dark:divide-slate-900 transition-colors">
        {users.map((user) => (
          <div key={user.id} className="px-5 py-4 flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-900/50 transition-colors">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 cursor-pointer active:scale-95 transition"
              onClick={() => handleUserClick(user.name)}
            >
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-90 dark:opacity-80" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate cursor-pointer active:opacity-60 transition inline-block"
                onClick={() => handleUserClick(user.name)}
              >
                {user.name}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-600 truncate mt-0.5">{user.bio}</p>
            </div>
            <button 
              onClick={() => toggleFollow(user.id)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                user.isFollowing 
                  ? 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 shadow-sm' 
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
              }`}
            >
              {user.isFollowing ? '已关注' : '关注'}
            </button>
          </div>
        ))}
      </main>

      {users.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 text-4xl">group_off</span>
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">暂时没有内容</p>
        </div>
      )}
    </div>
  );
};

export default FollowList;
