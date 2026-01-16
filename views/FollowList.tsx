
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MOCK_USERS = [
  { id: 'u101', name: '龙华小周', bio: '电子厂资深打工人', avatar: 'https://picsum.photos/seed/u101/100', isFollowing: true },
  { id: 'u102', name: '长安强哥', bio: '水电维修专家，专治疑难杂症', avatar: 'https://picsum.photos/seed/u102/100', isFollowing: false },
  { id: 'u103', name: '厂妹小丽', bio: '分享日常生活，寻找志同道合的朋友', avatar: 'https://picsum.photos/seed/u103/100', isFollowing: true },
  { id: 'u104', name: '老师傅老李', bio: '三十年木工经验，欢迎交流', avatar: 'https://picsum.photos/seed/u104/100', isFollowing: false },
  { id: 'u105', name: '深漂小赵', bio: '梦想在深圳买房的奋斗者', avatar: 'https://picsum.photos/seed/u105/100', isFollowing: true },
];

const FollowList: React.FC = () => {
  const { type } = useParams<{ type: 'following' | 'followers' }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState(MOCK_USERS);

  const toggleFollow = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        return { ...user, isFollowing: !user.isFollowing };
      }
      return user;
    }));
  };

  const title = type === 'following' ? '我的关注' : '我的粉丝';

  return (
    <div className="bg-white min-h-screen animate-in slide-in-from-right duration-300">
      <header className="px-4 py-3 bg-white sticky top-0 z-50 border-b border-slate-50 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-50 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      </header>

      <main className="divide-y divide-slate-50">
        {users.map((user) => (
          <div key={user.id} className="px-5 py-4 flex items-center gap-4 active:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{user.name}</h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.bio}</p>
            </div>
            <button 
              onClick={() => toggleFollow(user.id)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                user.isFollowing 
                  ? 'bg-white text-slate-400 border-slate-200' 
                  : 'bg-slate-900 text-white border-slate-900 shadow-sm'
              }`}
            >
              {user.isFollowing ? '已关注' : '回关'}
            </button>
          </div>
        ))}
      </main>

      {users.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-200 text-4xl">group_off</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">暂时没有内容</p>
        </div>
      )}
    </div>
  );
};

export default FollowList;
