
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_POSTS } from '../constants';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return MOCK_POSTS.filter(post => 
      post.title.toLowerCase().includes(lowerQuery) || 
      post.content.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const hotSearches = ['面试', '龙华', '工资', '防骗', '剥线钳', '长安'];

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case '工作互助': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      case '七彩生活': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case '法律咨询': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-700/50';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen animate-in fade-in duration-300 transition-colors">
      <header className="px-5 py-3 sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors">
        <button onClick={() => navigate(-1)} className="p-1 text-slate-400 dark:text-white active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-2.5 flex items-center gap-2 transition-colors border border-transparent focus-within:border-slate-200 dark:focus-within:border-slate-700">
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-xl">search</span>
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜一搜感兴趣的内容..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-300 dark:text-slate-600 active:scale-90">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>
      </header>

      <main className="px-5 pt-6 pb-24">
        {!query.trim() ? (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-orange-400 text-lg">local_fire_department</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">大家都在搜</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {hotSearches.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="mt-12 flex flex-col items-center justify-center opacity-30 select-none">
              <span className="material-symbols-outlined text-7xl mb-2 text-slate-200 dark:text-slate-800">auto_stories</span>
              <p className="text-xs font-bold text-slate-300 dark:text-slate-700">在这里发现工友们的真实故事</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">找到 {searchResults.length} 条相关结果</p>
              {searchResults.length > 0 && <span className="text-[10px] text-blue-500 font-bold">已按相关性排序</span>}
            </div>
            
            {searchResults.map((post) => (
              <article 
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-card border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[17px] font-black text-slate-900 dark:text-white mb-2 leading-tight line-clamp-2">
                      {post.title.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                        part.toLowerCase() === query.toLowerCase() 
                          ? <span key={i} className="text-orange-500 underline underline-offset-4">{part}</span> 
                          : part
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">{post.content}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.categories.map((cat, idx) => (
                        <span key={idx} className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tighter ${getCategoryStyle(cat)}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  {post.images.length > 0 && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-inner">
                      <img src={post.images[0]} className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity hover:opacity-100" alt="" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                   <div className="flex items-center gap-2">
                     <img src={post.author.avatar} className="w-5 h-5 rounded-full ring-1 ring-slate-100 dark:ring-slate-800" alt="" />
                     <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{post.author.name}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-300 dark:text-slate-700">
                     <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">favorite</span><span className="text-[10px] font-black">{post.likes}</span></div>
                     <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chat_bubble</span><span className="text-[10px] font-black">{post.comments}</span></div>
                   </div>
                </div>
              </article>
            ))}
            
            {searchResults.length === 0 && (
              <div className="py-24 text-center animate-in fade-in">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">search_off</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-sm font-bold">没有搜到相关内容呢</p>
                <p className="text-[11px] text-slate-300 dark:text-slate-800 mt-2">换个关键词试试，比如“面试”或者“工资”</p>
                <button 
                  onClick={() => setQuery('')}
                  className="mt-8 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black active:scale-95 transition"
                >
                  返回发现
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
