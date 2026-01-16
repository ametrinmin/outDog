
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
  
  // 初始化点赞和历史记录
  useEffect(() => {
    if (!id) return;
    const likedPosts = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    if (likedPosts.includes(id)) setIsLiked(true);
    if (post) setLikesCount(post.likes);

    const history = JSON.parse(localStorage.getItem('outdog_history') || '[]');
    const newHistory = [id, ...history.filter((pid: string) => pid !== id)].slice(0, 50);
    localStorage.setItem('outdog_history', JSON.stringify(newHistory));
  }, [id, post]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: { name: '强哥装修', avatar: 'https://picsum.photos/seed/worker1/100' },
      content: '这环境真不错，龙华确实是打工人的天堂，也是噩梦，看个人怎么闯了。',
      timestamp: '1小时前',
      likes: 12,
      isLiked: false,
      isAuthor: false,
      replies: [
        {
          id: 'c1-r1',
          author: { name: '老王闯深圳', avatar: CURRENT_USER.avatar },
          content: '确实，机会多但竞争也大，稳扎稳打最重要。',
          timestamp: '45分钟前',
          likes: 3,
          isAuthor: true,
          isLiked: false
        }
      ]
    }
  ]);
  
  const [replyTarget, setReplyTarget] = useState<{ id: string, name: string, parentId?: string } | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<ContentBlock[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  const commonEmojis = [
    '👍', '🙌', '🤝', '🔥', '👏', '😂', '💯', '🏠', 
    '🛠️', '💼', '❤️', '✅', '🎉', '💪', '🙏', '✨',
    '🤣', '😅', '🤔', '👀', '🌟', '🚀', '🌈', '🍺'
  ];

  if (!post) return <div className="p-10 text-center text-slate-400">帖子不存在</div>;

  const handleLikeToggle = () => {
    const likedPosts = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    let newLikedPosts = [...likedPosts];
    if (isLiked) {
      const newCount = Math.max(0, likesCount - 1);
      setLikesCount(newCount);
      newLikedPosts = newLikedPosts.filter(pid => pid !== id);
    } else {
      setLikesCount(likesCount + 1);
      if (id) newLikedPosts.push(id);
    }
    localStorage.setItem('outdog_liked_posts', JSON.stringify(newLikedPosts));
    setIsLiked(!isLiked);
  };

  const handleCommentMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMedia = Array.from(files).map((file: File) => ({
        id: `ca-${Date.now()}-${Math.random()}`,
        type: (file.type.startsWith('video/') ? 'video' : 'image') as any,
        value: URL.createObjectURL(file)
      }));
      setCommentAttachments(prev => [...prev, ...newMedia]);
      setShowEmojiPicker(false);
    }
  };

  const removeAttachment = (id: string) => {
    setCommentAttachments(prev => prev.filter(a => a.id !== id));
  };

  const submitComment = () => {
    if (!commentInput.trim() && commentAttachments.length === 0) return;

    const newComment: Comment = {
      id: `nc-${Date.now()}`,
      author: { name: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
      content: commentInput,
      attachments: commentAttachments.length > 0 ? [...commentAttachments] : undefined,
      timestamp: '刚刚',
      likes: 0,
      isLiked: false,
      isAuthor: CURRENT_USER.name === post.author.name
    };

    if (replyTarget) {
      const targetParentId = replyTarget.parentId || replyTarget.id;
      setComments(prev => prev.map(c => {
        if (c.id === targetParentId) {
          return {
            ...c,
            replies: [...(c.replies || []), { ...newComment, replyToName: replyTarget.name }]
          };
        }
        return c;
      }));
    } else {
      setComments([newComment, ...comments]);
    }

    // 重置状态
    setCommentInput('');
    setCommentAttachments([]);
    setReplyTarget(null);
    setShowEmojiPicker(false);
  };

  const startReply = (commentId: string, authorName: string, parentId?: string) => {
    setReplyTarget({ id: commentId, name: authorName, parentId });
    setShowEmojiPicker(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const renderAttachments = (attachments?: ContentBlock[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map(att => (
          <div key={att.id} className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-50 shrink-0">
            {att.type === 'image' ? (
              <img src={att.value} className="w-full h-full object-cover" alt="" />
            ) : (
              <video src={att.value} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-base font-bold text-slate-900">详情</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-slate-50 transition">
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
        </button>
      </header>

      <article className="px-5 py-6">
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-5">{post.title}</h1>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm">
              <img src={post.author.avatar || 'https://picsum.photos/seed/user/100'} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{post.author.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">{post.timestamp} · 广东</div>
            </div>
          </div>
          <button className="px-4 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold">关注</button>
        </div>

        <div className="space-y-4">
          {post.blocks ? post.blocks.map(block => (
            <div key={block.id}>
              {block.type === 'text' ? <p className="text-[15px] leading-relaxed text-slate-700">{block.value}</p> : 
               block.type === 'image' ? <img src={block.value} className="w-full rounded-xl" alt="" /> : 
               <video src={block.value} controls className="w-full rounded-xl" />}
            </div>
          )) : (
            <>
              <p className="text-[15px] text-slate-700">{post.content}</p>
              {post.images.map((img, i) => <img key={i} src={img} className="w-full rounded-xl mt-3" alt="" />)}
            </>
          )}
        </div>
      </article>

      <div className="h-2 bg-slate-50/50"></div>

      <section className="px-5 py-6 bg-white pb-40">
        <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
          全部评论 <span className="text-xs font-medium text-slate-400">{comments.length}</span>
        </h2>
        
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {comment.author.name} 
                      {comment.isAuthor && <span className="ml-1 text-[8px] bg-slate-900 text-white px-1 py-0.5 rounded">作者</span>}
                    </span>
                    <span className="text-[9px] text-slate-300">{comment.timestamp}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed" onClick={() => startReply(comment.id, comment.author.name!)}>
                    {comment.content}
                  </p>
                  {renderAttachments(comment.attachments)}
                  
                  <div className="flex items-center gap-4 mt-2.5">
                    <button className="text-[10px] text-slate-400 font-bold" onClick={() => startReply(comment.id, comment.author.name!)}>回复</button>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">favorite</span>
                      <span className="text-[10px] font-bold">{comment.likes}</span>
                    </div>
                  </div>

                  {comment.replies && comment.replies.map(reply => (
                    <div key={reply.id} className="mt-4 flex gap-2.5 pl-3 border-l-2 border-slate-50">
                      <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        <img src={reply.author.avatar} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[11px] font-bold text-slate-900">{reply.author.name}</span>
                          <span className="text-blue-400 text-[10px] font-medium">@ {reply.replyToName}</span>
                        </div>
                        <p className="text-[12px] text-slate-600 leading-relaxed" onClick={() => startReply(reply.id, reply.author.name!, comment.id)}>
                          {reply.content}
                        </p>
                        {renderAttachments(reply.attachments)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 底部交互区 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 z-[100] safe-bottom">
        
        {/* 表情包选择器 */}
        {showEmojiPicker && (
          <div className="grid grid-cols-8 gap-2 p-4 animate-in slide-in-from-bottom duration-300 border-b border-slate-50 max-h-48 overflow-y-auto no-scrollbar">
            {commonEmojis.map(emoji => (
              <button 
                key={emoji} 
                onClick={() => setCommentInput(prev => prev + emoji)}
                className="text-2xl p-2 hover:bg-slate-50 rounded-lg active:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* 附件预览 */}
        {commentAttachments.length > 0 && (
          <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar bg-slate-50/50">
            {commentAttachments.map(att => (
              <div key={att.id} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                {att.type === 'image' ? <img src={att.value} className="w-full h-full object-cover" alt="" /> : <video src={att.value} className="w-full h-full object-cover" />}
                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 输入行 */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-100/70 rounded-2xl px-3 py-2 border border-slate-50">
            <button 
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}
              className={`material-symbols-outlined text-xl transition ${showEmojiPicker ? 'text-blue-500 scale-110' : 'text-slate-400'}`}
            >
              mood
            </button>
            <input 
              ref={inputRef}
              type="text" 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder-slate-400 text-slate-800"
              placeholder={replyTarget ? `回复 @${replyTarget.name}...` : "说点什么吧..."}
            />
            {replyTarget && (
              <button onClick={() => setReplyTarget(null)} className="text-slate-300">
                <span className="material-symbols-outlined text-sm">cancel</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => commentFileInputRef.current?.click()}
              className="relative text-slate-400 hover:text-slate-900 transition p-1"
            >
              <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
              {commentAttachments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {commentAttachments.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={submitComment}
              disabled={!commentInput.trim() && commentAttachments.length === 0}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                commentInput.trim() || commentAttachments.length > 0 
                  ? 'bg-slate-900 text-white scale-105 shadow-md' 
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
        
        {/* 底层垫高 (适配部分手机安全区) */}
        <div className="h-6"></div>
      </div>

      <input 
        type="file" 
        ref={commentFileInputRef} 
        hidden 
        multiple 
        accept="image/*,video/*" 
        onChange={handleCommentMediaUpload} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .FILL-1 { font-variation-settings: 'FILL' 1; }
      `}</style>
    </div>
  );
};

export default PostDetail;
