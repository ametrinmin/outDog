
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UpdatePhone: React.FC = () => {
  const navigate = useNavigate();
  const [newPhone, setNewPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
      alert('请输入正确的手机号');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      alert('验证码已发送（模拟：1234）');
      setIsSending(false);
    }, 1000);
  };

  const handleUpdate = () => {
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
      alert('请输入正确的手机号');
      return;
    }
    if (code !== '1234') {
      alert('验证码错误');
      return;
    }
    localStorage.setItem('outdog_user_phone', newPhone);
    alert('手机号更新成功');
    navigate(-1);
  };

  return (
    <div className="bg-white min-h-screen animate-in slide-in-from-right duration-300">
      <header className="px-5 py-3 bg-white sticky top-0 z-40 flex items-center border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-slate-600 hover:bg-slate-100 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold text-slate-900 tracking-tight">修改手机号</h1>
      </header>

      <main className="p-6 space-y-8">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">新手机号</label>
            <div className="flex gap-2">
              <input 
                type="tel" 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-200 transition"
                placeholder="请输入11位手机号"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">验证码</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-200 transition"
                placeholder="模拟：1234"
              />
              <button 
                onClick={handleSendCode}
                disabled={isSending || newPhone.length < 11}
                className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition disabled:opacity-50"
              >
                {isSending ? '发送中...' : '获取验证码'}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={newPhone.length < 11 || code.length < 4}
          className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-[16px] shadow-lg shadow-slate-200 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          确认修改
        </button>
        
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          修改后，下次登录请使用新手机号。验证码将发送至新手机。
        </p>
      </main>
    </div>
  );
};

export default UpdatePhone;
