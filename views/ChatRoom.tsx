
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CHATS, MOCK_MESSAGES, CURRENT_USER } from '../constants';
import { Message, ContentBlock } from '../types';

const ChatRoom: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = MOCK_CHATS.find(c => c.id === id);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<ContentBlock[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonEmojis = [
    '👍', '🙌', '🤝', '🔥', '👏', '😂', '💯', '🏠', 
    '🛠️', '💼', '❤️', '✅', '🎉', '💪', '🙏', '✨',
    '🤣', '😅', '🤔', '👀', '🌟', '🚀', '🌈', '🍺',
    '😭', '😱', '🥳', '😎', '😴', '😷', '💩', '📞'
  ];

  // 初始化加载消息
  useEffect(() => {
    if (id && MOCK_MESSAGES[id]) {
      setMessages(MOCK_MESSAGES[id]);
    }
  }, [id]);

  // 注意：此处移除了对 [messages] 变化的 useEffect 自动滚动逻辑
  // 实现了“进入消息查看信息时不要往下滑动 默认置顶”

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMedia = Array.from(files).map((file: File) => ({
        id: `msg-att-${Date.now()}-${Math.random()}`,
        type: (file.type.startsWith('video/') ? 'video' : 'image') as any,
        value: URL.createObjectURL(file)
      }));
      setAttachments(prev => [...prev, ...newMedia]);
      setShowEmojiPicker(false);
    }
  };

  const removeAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleSend = () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: CURRENT_USER.id,
      text: inputValue,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setAttachments([]);
    setShowEmojiPicker(false);

    // 仅在主动发送消息时触发滚动到底部，方便查看刚发出的内容
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!chat) return <div className="p-10 text-center">对话不存在</div>;

  const renderMessageContent = (msg: Message) => {
    return (
      <div className="flex flex-col gap-2">
        {msg.text && (
          <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
            msg.isMe 
              ? 'bg-slate-900 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
          }`}>
            {msg.text}
          </div>
        )}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            {msg.attachments.map(att => (
              <div key={att.id} className="w-44 h-44 rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow-sm">
                {att.type === 'image' ? (
                  <img src={att.value} className="w-full h-full object-cover" alt="" />
                ) : (
                  <video src={att.value} className="w-full h-full object-cover" controls />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* 头部：移除在线状态标志 */}
      <header className="px-4 py-3 bg-white sticky top-0 z-[110] border-b border-slate-100 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-50">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 ring-2 ring-white">
            <img src={chat.participant.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{chat.participant.name}</h2>
            {/* 已剔除在线状态标志 */}
          </div>
        </div>
        <button className="p-2 text-slate-400">
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-24">
        <div className="text-center">
          <span className="px-3 py-1 rounded-full bg-slate-200/50 text-slate-400 text-[10px] font-medium">会话已开启</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in zoom-in-95 duration-200`}>
            <div className={`flex max-w-[85%] gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm border border-slate-100">
                <img src={msg.isMe ? CURRENT_USER.avatar : chat.participant.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                {renderMessageContent(msg)}
                <span className={`text-[10px] mt-1 text-slate-300 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 z-[120] safe-bottom px-4 pt-3">
        
        {/* Emoji 选择器面板 */}
        {showEmojiPicker && (
          <div className="grid grid-cols-8 gap-2 pb-4 mb-2 border-b border-slate-50 animate-in slide-in-from-bottom duration-300 max-h-48 overflow-y-auto no-scrollbar">
            {commonEmojis.map(emoji => (
              <button 
                key={emoji} 
                onClick={() => setInputValue(prev => prev + emoji)}
                className="text-2xl p-2 hover:bg-slate-50 rounded-xl active:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* 媒体预览区域 */}
        {attachments.length > 0 && (
          <div className="flex gap-2 pb-3 mb-1 overflow-x-auto no-scrollbar border-b border-slate-50 animate-in fade-in">
            {attachments.map(att => (
              <div key={att.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                {att.type === 'image' ? (
                  <img src={att.value} className="w-full h-full object-cover" />
                ) : (
                  <video src={att.value} className="w-full h-full object-cover" />
                )}
                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            ))}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        )}

        {/* 输入功能区 */}
        <div className="flex items-center gap-3 pb-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 p-1 hover:text-slate-900 transition active:scale-90"
          >
            <span className="material-symbols-outlined text-2xl">add_circle</span>
          </button>
          
          <div className="flex-1 bg-slate-100/70 rounded-2xl px-3 py-2 flex items-center gap-2 border border-slate-50">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`transition ${showEmojiPicker ? 'text-blue-500 scale-110' : 'text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-[22px]">mood</span>
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="说点真心话..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-700 placeholder-slate-400"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() && attachments.length === 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              inputValue.trim() || attachments.length > 0 
                ? 'bg-slate-900 text-white scale-105' 
                : 'bg-slate-100 text-slate-300 shadow-none'
            }`}
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </footer>

      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        multiple 
        accept="image/*,video/*" 
        onChange={handleMediaUpload} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ChatRoom;
