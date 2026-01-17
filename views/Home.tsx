
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_POSTS, MOCK_NOTIFICATIONS, CURRENT_USER } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [allPosts, setAllPosts] = useState([...MOCK_POSTS]);
  
  // 系统通知未读状态
  const hasUnreadNotifications = useMemo(() => MOCK_NOTIFICATIONS.some(n => !n.isRead), []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    setLikedIds(saved);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const categoriesList = [
    { id: 'all', label: '全部', icon: null },
    { id: '工作互助', label: '工作互助', icon: '💼' },
    { id: '七彩生活', label: '七彩生活', icon: '🌈' },
    { id: '法律咨询', label: '法律咨询', icon: '⚖️' },
    { id: '生活闲聊', label: '生活闲聊', icon: '🍵' },
    { id: '工具推荐', label: '工具推荐', icon: '🛠️' },
    { id: '安全教育', label: '安全教育', icon: '🛡️' },
  ];

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case '工作互助': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      case '七彩生活': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case '法律咨询': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-700/50';
      case '安全教育': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
      case '工具推荐': return 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); 
    const isLiked = likedIds.includes(postId);
    const post = allPosts.find(p => p.id === postId);
    let newLikedIds = [...likedIds];
    if (isLiked) {
      newLikedIds = newLikedIds.filter(id => id !== postId);
      if (post) post.likes = Math.max(0, post.likes - 1);
    } else {
      newLikedIds.push(postId);
      if (post) post.likes += 1;
    }
    setLikedIds(newLikedIds);
    localStorage.setItem('outdog_liked_posts', JSON.stringify(newLikedIds));
  };

  const pinnedPosts = useMemo(() => allPosts.filter(p => p.isPinned), [allPosts]);
  const filteredPosts = useMemo(() => {
    const nonPinnedPosts = allPosts.filter(p => !p.isPinned);
    if (selectedCategory === 'all') return nonPinnedPosts;
    return nonPinnedPosts.filter(post => post.categories.includes(selectedCategory));
  }, [selectedCategory, likedIds, allPosts]);

  const togglePostMute = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const updated = allPosts.map(p => {
      if (p.id === postId) {
        const newMuteStatus = !p.isMuted;
        const originalPost = MOCK_POSTS.find(o => o.id === postId);
        if (originalPost) originalPost.isMuted = newMuteStatus;
        return { ...p, isMuted: newMuteStatus };
      }
      return p;
    });
    setAllPosts(updated);
  };

  return (
    <div className="animate-in fade-in duration-500 bg-background-light dark:bg-slate-950 min-h-screen">
      <header className="px-5 py-3 bg-white/90 dark:bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md flex justify-between items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm shadow-orange-200 dark:shadow-none">
            <span className="material-symbols-outlined text-xl">pets</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">OUTDOG</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">Worker Force</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/notifications')} className="p-2 relative rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-ping"></span>
            )}
          </button>
          <button onClick={() => navigate('/search')} className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90">
            <span className="material-symbols-outlined text-[22px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </header>

      <div ref={categoryContainerRef} className="bg-background-light dark:bg-slate-950 px-5 py-4 overflow-x-auto no-scrollbar flex items-center gap-2 sticky top-[61px] z-30 backdrop-blur-sm scroll-smooth snap-x border-b border-transparent transition-colors">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl font-black text-[13px] whitespace-nowrap transition-all border shrink-0 snap-center ${
              selectedCategory === cat.id 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl dark:shadow-none scale-105' 
              : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
            }`}
          >
            {cat.icon && <span className="mr-2 text-base">{cat.icon}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      <main className="px-5 space-y-4 pt-2 pb-24">
        {/* 置顶消息栏 (单行可展开) */}
        {pinnedPosts.length > 0 && (
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
            <div 
              onClick={() => setIsAnnouncementsExpanded(!isAnnouncementsExpanded)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-blue-100/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="material-symbols-outlined text-blue-500 text-xl animate-bounce">campaign</span>
                <p className={`text-sm font-bold text-slate-800 dark:text-slate-200 ${isAnnouncementsExpanded ? '' : 'truncate'}`}>
                  {pinnedPosts[0].title}
                </p>
              </div>
              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isAnnouncementsExpanded ? 'rotate-180' : ''}`}>
                keyboard_arrow_down
              </span>
            </div>

            <div className={`grid transition-all duration-300 ${isAnnouncementsExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 space-y-4">
                  {pinnedPosts.map((pinned, idx) => (
                    <div key={pinned.id} className={`${idx !== 0 ? 'pt-4 border-t border-blue-100/30 dark:border-blue-800/30' : ''}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded uppercase">置顶</span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white" onClick={() => navigate(`/post/${pinned.id}`)}>{pinned.title}</h4>
                        </div>
                        {/* 禁言开关 */}
                        <button 
                          onClick={(e) => togglePostMute(e, pinned.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition-all ${
                            pinned.isMuted 
                            ? 'bg-rose-500 text-white shadow-sm' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-sm ${pinned.isMuted ? 'FILL-1' : ''}`}>speaker_notes_off</span>
                          {pinned.isMuted ? '已禁言' : '禁言评论'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2" onClick={() => navigate(`/post/${pinned.id}`)}>
                        {pinned.content}
                      </p>
                      <button 
                        onClick={() => navigate(`/post/${pinned.id}`)}
                        className="text-[10px] font-bold text-blue-500 flex items-center gap-0.5"
                      >
                        查看详情 <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 帖子信息流 */}
        {filteredPosts.map((post) => (
          <article key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="bg-white dark:bg-slate-900 rounded-[24px] p-5 shadow-card border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all cursor-pointer">
            <h3 className="text-[18px] font-black text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{post.content}</p>
            {post.images.length > 0 && (
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 mb-4">
                <img src={post.images[0]} className="w-full h-full object-cover opacity-90 dark:opacity-80" alt="" />
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.categories.map((cat, idx) => (
                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border shadow-sm ${getCategoryStyle(cat)}`}>
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <img src={post.author.avatar} className="w-6 h-6 rounded-full ring-2 ring-slate-50 dark:ring-slate-900" alt="" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span><span className="text-xs font-black">{post.comments}</span></div>
                <button onClick={(e) => handleLike(e, post.id)} className={`flex items-center gap-1.5 ${likedIds.includes(post.id) ? 'text-red-500' : ''}`}><span className={`material-symbols-outlined text-[18px] ${likedIds.includes(post.id) ? 'FILL-1' : ''}`}>favorite</span><span className="text-xs font-black">{post.likes}</span></button>
              </div>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
};

export default Home;
