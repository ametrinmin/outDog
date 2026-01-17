
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_POSTS, CURRENT_USER, MOCK_CHATS } from '../constants';

const UserPublicProfile: React.FC = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  const userData = useMemo(() => {
    if (name === CURRENT_USER.name) return CURRENT_USER;
    const userFirstPost = MOCK_POSTS.find(p => p.author.name === name);
    return {
      name: name,
      avatar: userFirstPost?.author.avatar || `https://picsum.photos/seed/${name}/100`,
      bio: '这位外包工友很低调，还没有填写简介。',
      following: Math.floor(Math.random() * 200),
      followers: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 10000)
    };
  }, [name]);

  const userPosts = useMemo(() => 
    MOCK_POSTS.filter(p => p.author.name === name),
  [name]);

  const handleMessage = () => {
    // 查找是否存在现有的聊天记录
    const existingChat = MOCK_CHATS.find(c => c.participant.name === name);
    if (existingChat) {
      navigate(`/chat/${existingChat.id}`);
    } else {
      // 修复：生成带有前缀的临时 ID，方便 ChatRoom 识别并动态创建会话
      // 格式：new-chat_用户名_Base64头像(模拟)
      navigate(`/chat/new-session_${name}`);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen animate-in fade-in duration-500 transition-colors">
      <header className="px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-8 text-base font-bold text-slate-900 dark:text-white truncate">工友主页</h1>
      </header>

      <div className="bg-white dark:bg-slate-900 px-6 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm shrink-0 border border-slate-200 dark:border-slate-800 transition-all">
            <img src={userData.avatar} alt="" className="w-full h-full object-cover opacity-90 dark:opacity-85" />
          </div>
          <div className="flex-1 pt-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3">{userData.name}</h2>
            
            {name !== CURRENT_USER.name && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    isFollowing 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg dark:shadow-none active:scale-95'
                  }`}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
                <button 
                  onClick={handleMessage}
                  className="flex-1 py-2 rounded-xl text-xs font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  私信
                </button>
              </div>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-4 line-clamp-2">{userData.bio}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 px-4">
          <button onClick={() => navigate(`/user/${userData.name}/follow/following`)} className="text-center flex-1 group">
            <div className="text-xl font-black text-slate-900 dark:text-white">{userData.following}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">关注</div>
          </button>
          <div className="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>
          <button onClick={() => navigate(`/user/${userData.name}/follow/followers`)} className="text-center flex-1 group">
            <div className="text-xl font-black text-slate-900 dark:text-white">{(userData.followers / 1000).toFixed(1)}k</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">粉丝</div>
          </button>
          <div className="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>
          <div className="text-center flex-1">
            <div className="text-xl font-black text-slate-900 dark:text-white">{(userData.likes / 1000).toFixed(1)}k</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">获赞</div>
          </div>
        </div>
      </div>

      <main className="p-5 pb-24">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 px-1 flex items-center gap-2">
          派遣经历 <span className="text-xs font-medium text-slate-400 dark:text-slate-600">{userPosts.length}</span>
        </h3>
        <div className="space-y-4">
          {userPosts.map(post => (
            <article 
              key={post.id} 
              onClick={() => navigate(`/post/${post.id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{post.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold">{post.timestamp}</span>
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
                    <span className="text-[10px] font-bold">{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">favorite_border</span>
                    <span className="text-[10px] font-bold">{post.likes}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {userPosts.length === 0 && (
            <div className="py-20 text-center text-slate-300 dark:text-slate-800">
              <span className="material-symbols-outlined text-5xl block mb-2 opacity-20">history_edu</span>
              <p className="text-sm font-medium">该工友还没有分享过动态</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPublicProfile;
