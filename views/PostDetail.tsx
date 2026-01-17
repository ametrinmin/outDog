import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_POSTS, CURRENT_USER } from '../constants';
import { Comment, ContentBlock } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = MOCK_POSTS.find(p => p.id === id);
  
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  
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
    if (post) setLikesCount(post.likes);

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
            id: 'r1',
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type the file parameter as File to resolve the 'unknown' error with URL.createObjectURL
      const newAttachments: ContentBlock[] = Array.from(files).map((file: File) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        type: 'image',
        value: URL.createObjectURL(file)
      }));
      setSelectedAttachments(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setSelectedAttachments(prev => prev.filter(a => a.id !== id));
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
      setComments(prev => prev.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        return c;
      }));
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
          <div key={att.id} className="w-24 h-24 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <img src={att.value} className="w-full h-full object-cover" alt="" onClick={() => window.open(att.value)} />
          </div>
        ))}
      </div>
    );
  };

  const renderReply = (reply: Comment, parentId: string) => (
    <div key={reply.id} className="relative pl-8 pt-4 group/reply">
      <div className="absolute left-0 top-0 w-px h-full bg-slate-100 dark:bg-slate-800 ml-4 group-last/reply:h-8"></div>
      <div className="absolute left-4 top-8 w-4 h-px bg-slate-100 dark:bg-slate-800"></div>
      
      <div className="flex gap-3">
        <img src={reply.author.avatar} className="w-8 h-8 rounded-full ring-1 ring-slate-100 dark:ring-slate-800 shrink-0 z-10 bg-white dark:bg-slate-950" alt="" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{reply.author.name}</span>
              {reply.replyToName && (
                <>
                  <span className="material-symbols-outlined text-[10px] text-slate-300 dark:text-slate-700">play_arrow</span>
                  <span className="text-[10px] font-bold text-blue-500/80 dark:text-blue-400/80">@{reply.replyToName}</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{reply.content}</p>
          {renderCommentMedia(reply.attachments)}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-300 dark:text-slate-700">{reply.timestamp}</span>
            <button onClick={() => { setReplyTarget({ comment: reply, parentId }); commentInputRef.current?.focus(); }} className="text-[10px] text-blue-500 font-bold active:opacity-60">回复</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors pb-40">
      <header className="sticky top-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors">
        <button onClick={handleBack} className="p-2 -ml-2 text-slate-900 dark:text-white active:scale-90 active:bg-slate-100 dark:active:bg-slate-800 rounded-full transition-all"><span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span></button>
        <h1 className="text-base font-bold dark:text-white">帖子正文</h1>
        <button onClick={() => setShowActionSheet(true)} className="p-2 -mr-2 text-slate-900 dark:text-white transition-opacity active:opacity-50"><span className="material-symbols-outlined text-2xl">more_horiz</span></button>
      </header>

      <article className="px-5 py-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">{post?.title}</h1>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={post?.author.avatar} className="h-10 w-10 rounded-full ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm" alt="" />
            <div>
              <div className="text-sm font-bold dark:text-white">{post?.author.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">{post?.timestamp} · 广东</div>
            </div>
          </div>
          <button onClick={() => setIsFollowing(!isFollowing)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 active:scale-95 transition-all'}`}>{isFollowing ? '已关注' : '关注'}</button>
        </div>
        <div className="space-y-4">
          <p className="text-[16px] leading-relaxed text-slate-700 dark:text-slate-300">{post?.content}</p>
          {post?.images.map((img, i) => <img key={i} src={img} className="w-full rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm" alt="" />)}
        </div>
      </article>

      <section className="px-5 py-6 bg-slate-50/30 dark:bg-slate-900/10">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider">全部评论 <span className="text-slate-400 dark:text-slate-600 font-black ml-1 text-xs">{comments.length}</span></h3>
        <div className="space-y-10">
          {comments.map((comment) => (
            <div key={comment.id}>
              <div className="flex gap-4">
                <img src={comment.author.avatar} className="w-10 h-10 rounded-full ring-1 ring-slate-100 dark:ring-slate-800 shrink-0 z-10 bg-white dark:bg-slate-950 shadow-sm" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{comment.author.name}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
                  {renderCommentMedia(comment.attachments)}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-300 dark:text-slate-700">{comment.timestamp}</span>
                    <button onClick={() => { setReplyTarget({ comment }); commentInputRef.current?.focus(); }} className="text-[10px] text-blue-500 font-black active:opacity-60 transition-opacity">回复</button>
                  </div>
                </div>
              </div>
              {comment.replies?.map(reply => renderReply(reply, comment.id))}
            </div>
          ))}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-[100] safe-bottom transition-colors shadow-2xl">
        {replyTarget && (
          <div className="px-5 py-2.5 bg-blue-50/90 dark:bg-blue-900/20 flex items-center justify-between border-b border-blue-100/30 dark:border-blue-900/30">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">正在回复 @{replyTarget.comment.author.name}</span>
            <button onClick={() => setReplyTarget(null)} className="text-blue-400 p-1"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {selectedAttachments.length > 0 && (
          <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-50 dark:border-slate-800">
            {selectedAttachments.map(att => (
              <div key={att.id} className="relative shrink-0">
                <img src={att.value} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" alt="" />
                <button onClick={() => removeAttachment(att.id)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-[12px]">close</span></button>
              </div>
            ))}
          </div>
        )}

        {showEmojiPicker && (
          <div className="px-4 py-4 grid grid-cols-8 gap-2 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 max-h-48 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
            {commonEmojis.map(emoji => (
              <button key={emoji} onClick={() => setInputText(prev => prev + emoji)} className="text-2xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl active:scale-125 transition-transform">{emoji}</button>
            ))}
          </div>
        )}

        <div className="px-4 py-3 flex items-center gap-3 pb-8">
          <button onClick={() => fileInputRef.current?.click()} className="text-slate-400"><span className="material-symbols-outlined text-2xl">add_photo_alternate</span></button>
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`transition ${showEmojiPicker ? 'text-blue-500' : 'text-slate-400'}`}><span className="material-symbols-outlined text-2xl">mood</span></button>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 flex items-center shadow-inner">
            <input 
              ref={commentInputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={replyTarget ? `回复 @${replyTarget.comment.author.name}...` : "发表你的看法..."} 
              className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>
          <button onClick={handleSend} disabled={!inputText.trim() && selectedAttachments.length === 0} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputText.trim() || selectedAttachments.length > 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 pointer-events-none'}`}>
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleMediaSelect} />
      </footer>

      {showActionSheet && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowActionSheet(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
            <button onClick={() => setShowActionSheet(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-2xl">取消</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;