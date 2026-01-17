
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountSecurity: React.FC = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('138****8888');
  const [showDeregisterModal, setShowDeregisterModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('outdog_user_phone');
    if (savedPhone) setPhoneNumber(savedPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
  }, []);

  const handleConfirmDeregister = () => {
    setIsProcessing(true);
    setTimeout(() => {
      localStorage.removeItem('outdog_user_info');
      localStorage.removeItem('outdog_user_phone');
      alert('账号已注销');
      navigate('/');
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="bg-background-light dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors">
      <header className="px-5 py-3 bg-white dark:bg-slate-900 sticky top-0 z-[60] flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-slate-600 dark:text-white active:scale-90">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold text-slate-900 dark:text-white tracking-tight">账号与安全</h1>
      </header>

      <main className="p-5 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors shadow-sm">
          <div onClick={() => navigate('/settings/account/phone')} className="flex items-center justify-between p-5 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200">手机号</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{phoneNumber}</span>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">chevron_right</span>
            </div>
          </div>
          <div onClick={() => setShowDeregisterModal(true)} className="flex items-center justify-between p-5 cursor-pointer active:bg-red-50 dark:active:bg-red-900/10 text-red-500 transition-colors">
            <span className="text-[15px] font-bold">注销账号</span>
            <span className="material-symbols-outlined text-red-200 dark:text-red-900/30">chevron_right</span>
          </div>
        </div>
      </main>

      {showDeregisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 transition-colors">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">report_problem</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white text-center mb-3">确定注销吗？</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-8">
              注销后数据将不可找回，请谨慎操作。
            </p>
            <div className="space-y-3">
              <button onClick={handleConfirmDeregister} disabled={isProcessing} className="w-full py-3.5 bg-red-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '确认注销'}
              </button>
              <button onClick={() => setShowDeregisterModal(false)} className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl active:bg-slate-100 dark:active:bg-slate-700 transition-all">返回</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSecurity;
