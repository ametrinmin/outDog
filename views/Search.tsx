
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

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-300">
      <header className="px-5 py-3 sticky top-0 z-50 bg-white border-b border-slate-50 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜一搜感兴趣的内容..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-700 placeholder-slate-300"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-300">
              <span className="material-symbols-outlined text-sm">cancel</span>
            </button>
          )}
        </div>
      </header>

      <main className="px-5 pt-6">
        {!query.trim() ? (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-sm font-bold text-slate-900 mb-4">热门搜索</h3>
            <div className="flex flex-wrap gap-2">
              {hotSearches.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 border border-slate-100 active:scale-95 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="mt-10">
              <h3 className="text-sm font-bold text-slate-900 mb-4">搜索历史</h3>
              <div className="flex flex-col divide-y divide-slate-50">
                <div className="py-3 flex justify-between items-center text-slate-400">
                  <span className="text-sm italic">暂无历史记录</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 mb-2">找到 {searchResults.length} 条相关结果</p>
            {searchResults.map((post) => (
              <article 
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="flex gap-4 py-3 border-b border-slate-50 active:bg-slate-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-1 truncate">{post.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{post.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-300">{post.timestamp}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-300">{post.likes} 赞</span>
                  </div>
                </div>
                {post.images.length > 0 && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                    <img src={post.images[0]} className="w-full h-full object-cover" />
                  </div>
                )}
              </article>
            ))}
            
            {searchResults.length === 0 && (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-100 mb-2">search_off</span>
                <p className="text-slate-300 text-sm font-medium">没搜到相关内容呢</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
