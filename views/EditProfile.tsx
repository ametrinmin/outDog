
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../constants';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState(CURRENT_USER);

  useEffect(() => {
    const savedUser = localStorage.getItem('outdog_user_info');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    avatar: user.avatar
  });

  const handleBack = () => {
    if (window.history.length <= 1) {
      navigate('/profile');
    } else {
      navigate(-1);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: url }));
    }
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    Object.assign(CURRENT_USER, updatedUser);
    localStorage.setItem('outdog_user_info', JSON.stringify(updatedUser));
    handleBack();
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors">
      <header className="px-5 py-3 bg-white dark:bg-slate-900 sticky top-0 z-[60] flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button 
          type="button"
          onClick={handleBack} 
          className="p-2 -ml-2 rounded-full text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white tracking-tight">编辑资料</h1>
        <button 
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold shadow-md active:scale-95 transition"
        >
          保存
        </button>
      </header>

      <main className="p-6 space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-900 shadow-sm transition-all">
              <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
            </div>
          </div>
          <button type="button" onClick={handleAvatarClick} className="text-blue-500 dark:text-blue-400 text-xs font-bold">更换头像</button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">昵称</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 transition"
              placeholder="请输入你的昵称"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">个人简介</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 transition resize-none"
              placeholder="介绍一下你自己..."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
