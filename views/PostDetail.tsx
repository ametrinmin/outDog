
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_POSTS, CURRENT_USER } from '../constants';
import { Comment, ContentBlock } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const post = MOCK_POSTS.find(p => p.id === id);
  
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(post?.isMuted || false);
  
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{comment: Comment, parentId?: string} | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<ContentBlock[]>([]);
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthor = post?.author.name === CURRENT_USER.name;

  useEffect(() => {
    if (!id) return;
    const likedPosts = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    if (likedPosts.includes(id)) setIsLiked(true);
    if (post) {
      setLikesCount(post.likes);
      setIsMuted(post.isMuted || false);
    }

    const mockComments: Comment[] = [
      {
        id: 'c1',
        author: { name: '水电小李', avatar: 'https://picsum.photos/seed/user1/100' },
        content: '老哥说得对，这地方确实机会多，但坑也多。',
        timestamp: '15分钟前',
        likes: 12,
        isLiked: false,
        attachments: [
          { id: 'att-1', type: 'image', value: 'https://picsum.photos/seed/factory1/400/300' }
        ],
        replies: [
          {
            id: 'c1-r1',
            author: { name: '搬砖小王', avatar: 'https://picsum.photos/seed/user3/100' },
            content: '深有体会，上次去那个厂差点被中介坑了。',
            timestamp: '10分钟前',
            likes: 2,
            isLiked: false,
            replyToName: '水电小李'
          }
        ]
      }
    ];
    setComments(mockComments);
  }, [id, post]);

  useEffect(() => {
    if (comments.length > 0 && location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-comment');
          setTimeout(() => {
            element.classList.remove('highlight-comment');
          }, 3000);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [comments, location.hash]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1); else navigate('/', { replace: true });
  };

  // 通用的用户跳转逻辑
  const handleUserClick = (userName?: string) => {
    if (!userName) return;
    if (userName === CURRENT_USER.name) {
      navigate('/profile');
    } else {
      navigate(`/user/${userName}`);
    }
  };

  const handlePostLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    
    const likedPosts = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    if (newLiked) likedPosts.push(id);
    else {
      const idx = likedPosts.indexOf(id);
      if (idx > -1) likedPosts.splice(idx, 1);
    }
    localStorage.setItem('outdog_liked_posts', JSON.stringify(likedPosts));
  };

  const handleCommentLike = (commentId: string, isReply: boolean = false, parentId?: string) => {
    setComments(prev => prev.map(c => {
      if (!isReply && c.id === commentId) {
        const newIsLiked = !c.isLiked;
        return { ...c, isLiked: newIsLiked, likes: newIsLiked ? c.likes + 1 : c.likes - 1 };
      }
      if (isReply && c.id === parentId && c.replies) {
        return {
          ...c,
          replies: c.replies.map(r => r.id === commentId ? { ...r, isLiked: !r.isLiked, likes: !r.isLiked ? r.likes + 1 : r.likes - 1 } : r)
        };
      }
      return c;
    }));
  };

  const handleShare = async () => {
    const shareData = {
      title: post?.title || 'OUTDOG 社区',
      text: post?.content || '来看看这条动态',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyToClipboard();
      }
    } catch (err) {
      console.warn('Share failed:', err);
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    } catch (e) {
      alert('复制失败，请手动复制浏览器地址栏链接');
    }
  };

  const toggleMuteStatus = () => {
    if (!isAuthor) return;
    const newStatus = !isMuted;
    setIsMuted(newStatus);
    if (post) post.isMuted = newStatus;
    setShowActionSheet(false);
  };

  const handleSend = () => {
    if (!inputText.trim() && selectedAttachments.length === 0) return;
    const newComment: Comment = {
      id: `new-${Date.now()}`,
      author: { name: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
      content: inputText,
      timestamp: '刚刚',
      likes: 0,
      isLiked: false,
      replies: [],
      attachments: selectedAttachments.length > 0 ? [...selectedAttachments] : undefined,
      replyToName: replyTarget ? replyTarget.comment.author.name : undefined
    };
    if (replyTarget) {
      const parentId = replyTarget.parentId || replyTarget.comment.id;
      setComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c));
    } else {
      setComments(prev => [newComment, ...prev]);
    }
    setInputText('');
    setSelectedAttachments([]);
    setReplyTarget(null);
  };

  const renderCommentMedia = (attachments?: ContentBlock[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map(att => (
          <div key={att.id} className="w-24 h-24 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <img src={att.value} className="w-full h-full object-cover" alt="" />
          </div>
        ))}
      </div>
    );
  };

  const renderReply = (reply: Comment, parentId: string) => (
    <div key={reply.id} id={`comment-${reply.id}`} className="relative pl-8 pt-4 group/reply scroll-mt-24 transition-all duration-700">
      <div className="absolute left-0 top-0 w-px h-full bg-slate-100 dark:bg-slate-800 ml-4 group-last/reply:h-8"></div>
      <div className="absolute left-4 top-8 w-4 h-px bg-slate-100 dark:bg-slate-800"></div>
      <div className="flex gap-3">
        <img 
          src={reply.author.avatar} 
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 z-10 cursor-pointer" 
          alt="" 
          onClick={() => handleUserClick(reply.author.name)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                onClick={() => handleUserClick(reply.author.name)}
              >
                {reply.author.name}
              </span>
              {reply.replyToName && (
                <span 
                  className="text-[10px] font-bold text-blue-500/80 cursor-pointer"
                  onClick={() => handleUserClick(reply.replyToName)}
                >
                  @{reply.replyToName}
                </span>
              )}
            </div>
            <button 
              onClick={() => handleCommentLike(reply.id, true, parentId)}
              className={`flex items-center gap-0.5 text-[10px] font-black ${reply.isLiked ? 'text-red-500' : 'text-slate-400'}`}
            >
              <span className={`material-symbols-outlined text-sm ${reply.isLiked ? 'FILL-1' : ''}`}>favorite</span>
              {reply.likes > 0 && reply.likes}
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{reply.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-300 dark:text-slate-700">{reply.timestamp}</span>
            {!isMuted && (
              <button onClick={() => { setReplyTarget({ comment: reply, parentId }); commentInputRef.current?.focus(); }} className="text-[10px] text-blue-500 font-bold">回复</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors pb-40">
      <header className="sticky top-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors">
        <button onClick={handleBack} className="p-2 -ml-2 text-slate-900 dark:text-white"><span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span></button>
        <h1 className="text-sm font-bold dark:text-white">帖子正文</h1>
        <button onClick={() => setShowActionSheet(true)} className="p-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
        </button>
      </header>

      <article className="px-5 py-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-5 tracking-tight leading-tight">{post?.title}</h1>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleUserClick(post?.author.name)}>
            <img src={post?.author.avatar} className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100" alt="" />
            <div>
              <div className="text-sm font-bold dark:text-white">{post?.author.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">{post?.timestamp} · 广东</div>
            </div>
          </div>
          <button onClick={() => setIsFollowing(!isFollowing)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>{isFollowing ? '已关注' : '关注'}</button>
        </div>
        <div className="space-y-4">
          <p className="text-[16px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post?.content}</p>
          {post?.images.map((img, i) => <img key={i} src={img} className="w-full rounded-2xl border border-slate-100 dark:border-slate-800" alt="" />)}
        </div>

        <div className="flex items-center justify-center gap-3 py-10 border-b border-slate-50 dark:border-slate-900">
          <button 
            onClick={handlePostLike}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all active:scale-105 ${isLiked ? 'bg-red-50 border-red-100 text-red-500 dark:bg-red-900/10 dark:border-red-900/20' : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800'}`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isLiked ? 'FILL-1' : ''}`}>favorite</span>
            <span className="text-[11px] font-black">{likesCount}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800 transition-all active:scale-105"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            <span className="text-[11px] font-black">分享</span>
          </button>
        </div>
      </article>

      <section className="px-5 py-6 bg-slate-50/30 dark:bg-slate-900/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">全部评论 <span className="text-slate-400 dark:text-slate-600 font-black ml-1 text-[10px]">{comments.length}</span></h3>
          {isMuted && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm">lock</span>
              禁言中
            </span>
          )}
        </div>
        <div className="space-y-10">
          {comments.map((comment) => (
            <div key={comment.id} id={`comment-${comment.id}`} className="scroll-mt-20 rounded-2xl">
              <div className="flex gap-4 p-2">
                <img 
                  src={comment.author.avatar} 
                  className="w-10 h-10 rounded-full shrink-0 z-10 shadow-sm cursor-pointer" 
                  alt="" 
                  onClick={() => handleUserClick(comment.author.name)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span 
                      className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      onClick={() => handleUserClick(comment.author.name)}
                    >
                      {comment.author.name}
                    </span>
                    <button 
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center gap-1 text-xs font-black ${comment.isLiked ? 'text-red-500' : 'text-slate-400'}`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${comment.isLiked ? 'FILL-1' : ''}`}>favorite</span>
                      {comment.likes > 0 && comment.likes}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
                  {renderCommentMedia(comment.attachments)}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-300 dark:text-slate-700">{comment.timestamp}</span>
                    {!isMuted && (
                      <button onClick={() => { setReplyTarget({ comment }); commentInputRef.current?.focus(); }} className="text-[10px] text-blue-500 font-black">回复</button>
                    )}
                  </div>
                </div>
              </div>
              {comment.replies?.map(reply => renderReply(reply, comment.id))}
            </div>
          ))}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-[100] safe-bottom transition-colors">
        {isMuted ? (
          <div className="px-5 py-6 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 italic">
            <span className="material-symbols-outlined text-xl">lock_open_right</span>
            <span className="text-sm font-bold">该帖子作者已开启禁言</span>
          </div>
        ) : (
          <div className="px-4 py-3 flex items-center gap-3 pb-8">
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-400"><span className="material-symbols-outlined text-2xl">add_photo_alternate</span></button>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-4 py-2 flex items-center gap-2 border border-slate-50 dark:border-slate-800 shadow-inner">
              <input 
                ref={commentInputRef}
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={replyTarget ? `回复 @${replyTarget.comment.author.name}...` : "说点什么..."} 
                className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 text-slate-700 dark:text-slate-200"
              />
            </div>
            <button onClick={handleSend} disabled={!inputText.trim()} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${inputText.trim() ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        )}
      </footer>

      {showActionSheet && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowActionSheet(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-4 space-y-2">
              <button onClick={() => { copyToClipboard(); setShowActionSheet(false); }} className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 active:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">link</span>
                复制链接
              </button>
              
              {isAuthor && (
                <button 
                  onClick={toggleMuteStatus} 
                  className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 ${isMuted ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'}`}
                >
                  <span className="material-symbols-outlined">{isMuted ? 'speaker_notes' : 'speaker_notes_off'}</span>
                  {isMuted ? '解除禁言' : '开启禁言 (仅作者本人可用)'}
                </button>
              )}
              
              {!isAuthor && (
                <button onClick={() => { alert('举报已提交，我们会尽快核实'); setShowActionSheet(false); }} className="w-full py-4 bg-rose-50 text-rose-500 font-bold rounded-2xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">report</span>
                  投诉举报此帖
                </button>
              )}
            </div>
            <div className="p-4 pt-0">
              <button onClick={() => setShowActionSheet(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl">取消</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .highlight-comment {
          animation: comment-flash 3s ease-out forwards;
        }
        @keyframes comment-flash {
          0% { background-color: rgba(59, 130, 246, 0.4); transform: scale(1.02); }
          20% { background-color: rgba(59, 130, 246, 0.2); transform: scale(1); }
          100% { background-color: transparent; }
        }
        .FILL-1 { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
};

export default PostDetail;
