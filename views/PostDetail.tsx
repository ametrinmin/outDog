
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<ContentBlock[]>([]);
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthor = post?.author.name === CURRENT_USER.name;
  const commonEmojis = ['👍', '🙌', '🤝', '🔥', '👏', '😂', '💯', '🏠', '🛠️', '💼', '❤️', '✅', '🎉', '💪', '🙏', '✨', '🤣', '😅', '🤔', '👀', '🌟', '🚀', '🌈', '🍺'];

  useEffect(() => {
    if (!id) return;
    const likedPosts = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    if (likedPosts.includes(id)) setIsLiked(true);
    if (post) {
      setLikesCount(post.likes);
      setIsMuted(post.isMuted || false);
    }

    // 模拟评论数据，其中 ID 需要与通知中的 commentId 对应
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

  // 处理从通知跳转过来的锚点定位和高亮
  useEffect(() => {
    if (comments.length > 0 && location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        // 稍微延迟确保 DOM 渲染完成
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-comment');
          // 3秒后移除高亮
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

  const toggleMuteStatus = () => {
    const newStatus = !isMuted;
    setIsMuted(newStatus);
    if (post) post.isMuted = newStatus;
    setShowActionSheet(false);
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: ContentBlock[] = Array.from(files).map((file: File) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        type: 'image',
        value: URL.createObjectURL(file)
      }));
      setSelectedAttachments(prev => [...prev, ...newAttachments]);
    }
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
    setShowEmojiPicker(false);
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
        <img src={reply.author.avatar} className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 z-10" alt="" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{reply.author.name}</span>
            {reply.replyToName && (
              <span className="text-[10px] font-bold text-blue-500/80">@{reply.replyToName}</span>
            )}
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
        <h1 className="text-base font-bold dark:text-white">帖子正文</h1>
        <button onClick={() => setShowActionSheet(true)} className="p-2 -mr-2 text-slate-900 dark:text-white"><span className="material-symbols-outlined text-2xl">more_horiz</span></button>
      </header>

      <article className="px-5 py-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">{post?.title}</h1>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={post?.author.avatar} className="h-10 w-10 rounded-full" alt="" />
            <div>
              <div className="text-sm font-bold dark:text-white">{post?.author.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">{post?.timestamp} · 广东</div>
            </div>
          </div>
          <button onClick={() => setIsFollowing(!isFollowing)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>{isFollowing ? '已关注' : '关注'}</button>
        </div>
        <div className="space-y-4">
          <p className="text-[16px] leading-relaxed text-slate-700 dark:text-slate-300">{post?.content}</p>
          {post?.images.map((img, i) => <img key={i} src={img} className="w-full rounded-2xl border border-slate-100 dark:border-slate-800" alt="" />)}
        </div>
      </article>

      <section className="px-5 py-6 bg-slate-50/30 dark:bg-slate-900/10 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">全部评论 <span className="text-slate-400 dark:text-slate-600 font-black ml-1 text-xs">{comments.length}</span></h3>
          {isMuted && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg animate-pulse">
              <span className="material-symbols-outlined text-sm">lock</span>
              禁言中
            </span>
          )}
        </div>
        <div className="space-y-10">
          {comments.map((comment) => (
            <div key={comment.id} id={`comment-${comment.id}`} className="scroll-mt-20 transition-all duration-700 rounded-2xl">
              <div className="flex gap-4 p-2">
                <img src={comment.author.avatar} className="w-10 h-10 rounded-full shrink-0 z-10 shadow-sm" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{comment.author.name}</span>
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
            <span className="text-sm font-bold">该帖子已开启禁言，暂不支持评论</span>
          </div>
        ) : (
          <div className="px-4 py-3 flex items-center gap-3 pb-8">
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-400"><span className="material-symbols-outlined text-2xl">add_photo_alternate</span></button>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5">
              <input 
                ref={commentInputRef}
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={replyTarget ? `回复 @${replyTarget.comment.author.name}...` : "发表你的看法..."} 
                className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-700 dark:text-slate-200"
              />
            </div>
            <button onClick={handleSend} disabled={!inputText.trim()} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputText.trim() ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        )}
      </footer>

      {showActionSheet && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowActionSheet(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300">
            {(post?.isPinned || isAuthor) && (
              <button 
                onClick={toggleMuteStatus} 
                className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">{isMuted ? 'speaker_notes' : 'speaker_notes_off'}</span>
                {isMuted ? '开启评论区' : '关闭评论区 (禁言)'}
              </button>
            )}
            <button onClick={() => setShowActionSheet(false)} className="w-full py-4 mt-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl">取消</button>
          </div>
        </div>
      )}
      
      <style>{`
        /* 评论闪烁高亮动画 */
        .highlight-comment {
          animation: comment-flash 3s ease-out forwards;
        }
        @keyframes comment-flash {
          0% { background-color: rgba(59, 130, 246, 0.4); transform: scale(1.02); }
          20% { background-color: rgba(59, 130, 246, 0.2); transform: scale(1); }
          100% { background-color: transparent; }
        }
        .dark .highlight-comment {
          animation: comment-flash-dark 3s ease-out forwards;
        }
        @keyframes comment-flash-dark {
          0% { background-color: rgba(30, 64, 175, 0.6); transform: scale(1.02); }
          20% { background-color: rgba(30, 64, 175, 0.3); transform: scale(1); }
          100% { background-color: transparent; }
        }
        .FILL-1 { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
};

export default PostDetail;
