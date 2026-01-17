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

  const commonEmojis = ['👍', '🙌', '🤝', '🔥', '👏', '😂', '💯', '🏠', '🛠️', '💼', '❤️', '✅', '🎉', '💪', '🙏', '✨', '🤣', '😅', '🤔', '👀', '🌟', '🚀', '🌈', '🍺'];

  useEffect(() => {
    if (id && MOCK_MESSAGES[id]) setMessages(MOCK_MESSAGES[id]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/messages', { replace: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type the file parameter as File to resolve the 'unknown' error with URL.createObjectURL
      const newAttachments: ContentBlock[] = Array.from(files).map((file: File) => ({
        id: `m-att-${Date.now()}-${Math.random()}`,
        type: 'image',
        value: URL.createObjectURL(file)
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
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
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (!chat) return <div className="p-10 text-center dark:text-white">对话不存在</div>;

  const renderMessageContent = (msg: Message) => (
    <div className="flex flex-col gap-2">
      {msg.text && (
        <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-colors ${
          msg.isMe 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none' 
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
        }`}>
          {msg.text}
        </div>
      )}
      {msg.attachments && msg.attachments.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
          {msg.attachments.map(att => (
            <div key={att.id} className="w-44 h-44 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm">
              <img src={att.value} className="w-full h-full object-cover" alt="" onClick={() => window.open(att.value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 transition-colors">
      <header className="px-4 py-3 bg-white dark:bg-slate-950 sticky top-0 z-[110] border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-sm transition-colors">
        <button onClick={handleBack} className="p-2 -ml-2 text-slate-600 dark:text-white rounded-full active:bg-slate-50 dark:active:bg-slate-900 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 ring-2 ring-white dark:ring-slate-900 cursor-pointer">
            <img src={chat.participant.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{chat.participant.name}</h2>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-24">
        <div className="text-center"><span className="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 text-[10px] font-medium">会话已开启</span></div>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in zoom-in-95 duration-200`}>
            <div className={`flex max-w-[85%] gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800">
                <img src={msg.isMe ? CURRENT_USER.avatar : chat.participant.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                {renderMessageContent(msg)}
                <span className={`text-[10px] mt-1 text-slate-300 dark:text-slate-700 ${msg.isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-[120] safe-bottom px-4 pt-3 transition-colors">
        {attachments.length > 0 && (
          <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-slate-50 dark:border-slate-900">
            {attachments.map(att => (
              <div key={att.id} className="relative shrink-0">
                <img src={att.value} className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800" alt="" />
                <button onClick={() => removeAttachment(att.id)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-[12px]">close</span></button>
              </div>
            ))}
          </div>
        )}

        {showEmojiPicker && (
          <div className="grid grid-cols-8 gap-2 pb-4 mb-2 border-b border-slate-50 dark:border-slate-800 animate-in slide-in-from-bottom duration-300 max-h-48 overflow-y-auto no-scrollbar">
            {commonEmojis.map(emoji => (
              <button key={emoji} onClick={() => setInputValue(prev => prev + emoji)} className="text-2xl p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl active:scale-125 transition">{emoji}</button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 pb-6">
          <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 dark:text-slate-600 p-1 active:scale-90 transition"><span className="material-symbols-outlined text-2xl">add_photo_alternate</span></button>
          <div className="flex-1 bg-slate-100/70 dark:bg-slate-900/70 rounded-2xl px-3 py-2 flex items-center gap-2 border border-slate-50 dark:border-slate-800 transition-colors shadow-inner">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`transition ${showEmojiPicker ? 'text-blue-500' : 'text-slate-400 dark:text-slate-600'}`}><span className="material-symbols-outlined text-[22px]">mood</span></button>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="说点真心话..." className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-700" />
          </div>
          <button onClick={handleSend} disabled={!inputValue.trim() && attachments.length === 0} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${inputValue.trim() || attachments.length > 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-800 shadow-none'}`}>
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </footer>
      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default ChatRoom;