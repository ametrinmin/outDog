
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_POSTS } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const pinnedRef = useRef<HTMLDivElement>(null);

  // 初始化点赞状态
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    setLikedIds(saved);
  }, []);

  const categoriesList = [
    { id: 'all', label: '全部', icon: null },
    { id: '工作互助', label: '工作互助', icon: '💼' },
    { id: '薪资讨论', label: '薪资讨论', icon: '💰' },
    { id: '法律咨询', label: '法律咨询', icon: '⚖️' },
    { id: '生活闲聊', label: '生活闲聊', icon: '🍵' },
    { id: '工具推荐', label: '工具推荐', icon: '🛠️' },
    { id: '安全教育', label: '安全教育', icon: '🛡️' },
  ];

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); // 阻止跳转到详情页
    const isLiked = likedIds.includes(postId);
    const post = MOCK_POSTS.find(p => p.id === postId);
    
    let newLikedIds = [...likedIds];
    if (isLiked) {
      // 取消点赞
      newLikedIds = newLikedIds.filter(id => id !== postId);
      if (post) post.likes = Math.max(0, post.likes - 1);
    } else {
      // 新增点赞
      newLikedIds.push(postId);
      if (post) post.likes += 1;
    }

    setLikedIds(newLikedIds);
    localStorage.setItem('outdog_liked_posts', JSON.stringify(newLikedIds));
  };

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_POSTS;
    return MOCK_POSTS.filter(post => post.categories.includes(selectedCategory));
  }, [selectedCategory, likedIds]); // 当点赞状态变化时重新计算以刷新 UI

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pinnedRef.current && !pinnedRef.current.contains(event.target as Node)) {
        setIsPinnedExpanded(false);
      }
    };
    if (isPinnedExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPinnedExpanded]);

  const fullPinnedContent = "关于防范招工诈骗的紧急提醒：近期发现多起以高薪日结、不扣社保、入职即送礼品为诱饵的非法招工行为。请各位工友务必通过正规渠道求职，不要轻信路边小广告，更不要在面试前缴纳任何形式的保证金、押金。遇到可疑情况请及时联系社区小助手或拨打110。";

  return (
    <div className="animate-in fade-in duration-500">
      <header className="px-5 py-3 bg-white/90 sticky top-0 z-40 backdrop-blur-md flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-400 rounded-xl flex items-center justify-center text-white shadow-sm shadow-orange-200">
            <span className="material-symbols-outlined text-xl">pets</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">OUTDOG</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">Worker Force</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/search')}
            className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <div className="bg-background-light px-5 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 sticky top-[68px] z-30 backdrop-blur-sm bg-background-light/80">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold text-[12px] whitespace-nowrap transition-all border shrink-0 ${
              selectedCategory === cat.id 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
              : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 active:scale-95'
            }`}
          >
            {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      <main className="px-5 space-y-4 pt-2">
        {selectedCategory === 'all' && (
          <div 
            ref={pinnedRef}
            onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
            className={`bg-orange-50/80 rounded-xl px-4 py-2.5 border border-orange-100/50 flex flex-col gap-2 transition-all duration-300 cursor-pointer ${isPinnedExpanded ? 'shadow-lg shadow-orange-100/50 scale-[1.02]' : 'active:opacity-70'}`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 text-orange-600 rounded-lg p-1 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">campaign</span>
              </div>
              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-black bg-orange-600 text-white px-1.5 py-0.5 rounded shrink-0">置顶</span>
                {!isPinnedExpanded && (
                  <p className="text-xs font-bold text-slate-800 truncate">关于防范招工诈骗的紧急提醒：高薪日结需谨慎...</p>
                )}
              </div>
              <span className={`material-symbols-outlined text-orange-300 text-sm transition-transform duration-300 ${isPinnedExpanded ? 'rotate-90' : ''}`}>
                chevron_right
              </span>
            </div>
            {isPinnedExpanded && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 pb-2">
                <p className="text-xs leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                  {fullPinnedContent}
                </p>
              </div>
            )}
          </div>
        )}

        {filteredPosts.map((post) => (
          <article 
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 relative group active:scale-[0.98] transition-transform cursor-pointer animate-in fade-in slide-in-from-bottom-3"
          >
            <h3 className="text-[17px] font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            <div className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">
              {post.content}
            </div>
            
            {post.images.length > 0 && (
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 mb-3">
                <img src={post.images[0]} alt="Post content" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.categories.map((cat, idx) => (
                <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black border shadow-sm ${
                  cat === '薪资讨论' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  cat === '工作互助' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {cat}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                  <img src={post.author.avatar || 'https://picsum.photos/seed/user/100'} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-slate-600">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-slate-400">{post.timestamp}</span>
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[17px]">chat_bubble_outline</span>
                    <span className="text-[11px] font-bold">{post.comments}</span>
                  </div>
                  <button 
                    onClick={(e) => handleLike(e, post.id)}
                    className={`flex items-center gap-1 transition-all active:scale-125 ${likedIds.includes(post.id) ? 'text-red-500' : 'text-slate-400'}`}
                  >
                    <span className={`material-symbols-outlined text-[17px] ${likedIds.includes(post.id) ? 'FILL-1' : ''}`}>favorite</span>
                    <span className="text-[11px] font-bold">{post.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredPosts.length === 0 && (
          <div className="py-20 text-center text-slate-300">
            <span className="material-symbols-outlined text-4xl block mb-2">inbox</span>
            <p className="text-sm">该分类下暂无动态</p>
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .FILL-1 { font-variation-settings: 'FILL' 1; }
      `}</style>
    </div>
  );
};

export default Home;
