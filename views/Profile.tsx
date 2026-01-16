
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER, MOCK_POSTS } from '../constants';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'history'>('posts');
  const [refreshToggle, setRefreshToggle] = useState(false); // Used to trigger re-renders

  const myPosts = useMemo(() => 
    MOCK_POSTS.filter(p => p.author.name === CURRENT_USER.name),
  [refreshToggle]);

  const likedPosts = useMemo(() => {
    const likedIds = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    return MOCK_POSTS.filter(p => likedIds.includes(p.id));
  }, [activeTab, refreshToggle]);

  const browseHistory = useMemo(() => {
    const historyIds = JSON.parse(localStorage.getItem('outdog_history') || '[]');
    // Keep the order of historyIds
    return historyIds.map((id: string) => MOCK_POSTS.find(p => p.id === id)).filter(Boolean);
  }, [activeTab, refreshToggle]);

  const handleDeletePost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('确定要彻底删除这篇动态吗？删除后不可恢复。')) return;
    
    const index = MOCK_POSTS.findIndex(p => p.id === id);
    if (index !== -1) {
      MOCK_POSTS.splice(index, 1);
      
      // Clean up likes and history
      const likedIds = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
      localStorage.setItem('outdog_liked_posts', JSON.stringify(likedIds.filter((pid: string) => pid !== id)));
      
      const historyIds = JSON.parse(localStorage.getItem('outdog_history') || '[]');
      localStorage.setItem('outdog_history', JSON.stringify(historyIds.filter((pid: string) => pid !== id)));
      
      setRefreshToggle(!refreshToggle);
    }
  };

  const handleEditPost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  const renderContent = () => {
    const list = activeTab === 'posts' ? myPosts : activeTab === 'likes' ? likedPosts : browseHistory;
    
    if (list.length === 0) {
      return (
        <div className="py-20 text-center animate-in fade-in">
          <span className="material-symbols-outlined text-4xl text-slate-100 block mb-2">
            {activeTab === 'posts' ? 'post_add' : activeTab === 'likes' ? 'heart_broken' : 'history'}
          </span>
          <p className="text-slate-300 text-sm">暂无相关动态</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 pt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {list.map((post: any) => (
          <article 
            key={post.id} 
            onClick={() => navigate(`/post/${post.id}`)}
            className="bg-white rounded-xl p-4 shadow-card border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <h3 className="text-[16px] font-bold text-slate-900 leading-snug mb-1">{post.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-1 mb-3">{post.content}</p>
            <div className="flex items-center justify-between mt-3 pt-1">
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span className="font-medium tracking-tight text-slate-400/80">{post.timestamp}</span>
                <span className="w-[1px] h-3 bg-slate-200"></span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">chat_bubble_outline</span> {post.comments}</span>
                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">favorite_border</span> {post.likes}</span>
                </div>
              </div>
              {activeTab === 'posts' && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => handleEditPost(e, post.id)}
                    className="text-slate-400 hover:text-blue-600 p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_square</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeletePost(e, post.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 bg-background-light min-h-screen">
      <header className="px-5 py-3 bg-white sticky top-0 z-40 backdrop-blur-md flex justify-between items-center border-b border-slate-100">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">个人中心</h1>
        <button onClick={() => navigate('/settings')} className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
        </button>
      </header>

      <section className="bg-white pt-6 pb-2 px-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden ring-4 ring-white shadow-sm border border-slate-50">
              <img src={CURRENT_USER.avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-1 border-2 border-white">
              <span className="material-symbols-outlined block" style={{ fontSize: '12px' }}>edit</span>
            </div>
          </div>
          <div className="flex-1 pt-2">
            <h2 className="text-xl font-black text-slate-900 leading-tight">{CURRENT_USER.name}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-2 line-clamp-2">{CURRENT_USER.bio}</p>
          </div>
        </div>

        {/* 调大关注和粉丝展示比例，横向拉开距离 */}
        <div className="flex items-center justify-around mt-8 pb-6 px-4 border-b border-slate-50/50">
          <button 
            onClick={() => navigate('/follow/following')}
            className="flex-1 text-center active:opacity-60 transition-opacity group"
          >
            <div className="text-2xl font-black text-slate-900 group-active:scale-110 transition-transform">{CURRENT_USER.following}</div>
            <div className="text-[11px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">关注</div>
          </button>
          
          <div className="w-px h-8 bg-slate-100"></div>
          
          <button 
            onClick={() => navigate('/follow/followers')}
            className="flex-1 text-center active:opacity-60 transition-opacity group"
          >
            <div className="text-2xl font-black text-slate-900 group-active:scale-110 transition-transform">{(CURRENT_USER.followers / 1000).toFixed(1)}k</div>
            <div className="text-[11px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">粉丝</div>
          </button>
        </div>
      </section>

      <div className="sticky top-[52px] z-30 bg-white shadow-sm">
        <div className="flex w-full">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm transition-all border-b-2 ${activeTab === 'posts' ? 'font-bold text-slate-900 border-slate-900' : 'font-medium text-slate-400 border-transparent'}`}
          >
            我的发帖 <span className="ml-1 text-[10px] font-normal opacity-60">({myPosts.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 text-sm transition-all border-b-2 ${activeTab === 'likes' ? 'font-bold text-slate-900 border-slate-900' : 'font-medium text-slate-400 border-transparent'}`}
          >
            我的点赞 <span className="ml-1 text-[10px] font-normal opacity-60">({likedPosts.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm transition-all border-b-2 ${activeTab === 'history' ? 'font-bold text-slate-900 border-slate-900' : 'font-medium text-slate-400 border-transparent'}`}
          >
            历史浏览 <span className="ml-1 text-[10px] font-normal opacity-60">({browseHistory.length})</span>
          </button>
        </div>
      </div>

      <main className="px-5 pb-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default Profile;
