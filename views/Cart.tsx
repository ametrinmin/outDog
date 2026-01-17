
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
      const items = cart.map((item: any) => {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
        return { ...product, quantity: item.quantity };
      }).filter((p: any) => p.id);
      setCartItems(items);
    };
    loadCart();
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
    const item = cart.find((i: any) => i.productId === id);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
      localStorage.setItem('outdog_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: item.quantity } : i));
    }
  };

  const removeItem = (id: string) => {
    let cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
    cart = cart.filter((i: any) => i.productId !== id);
    localStorage.setItem('outdog_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 transition-colors">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-[100] flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors px-5 py-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold text-slate-900 dark:text-white tracking-tight">购物车</h1>
      </header>

      <main className="p-5 pt-[72px] pb-32 space-y-4">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 transition-colors">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800" onClick={() => navigate(`/product/${item.id}`)}>
                <img src={item.image} className="w-full h-full object-cover opacity-90 dark:opacity-80" alt="" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{item.name}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-red-500">¥{item.price}</span>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1 px-2 border border-slate-100 dark:border-slate-700">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 dark:text-slate-500 font-bold active:scale-125 transition-all w-5 h-5 flex items-center justify-center">-</button>
                    <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 dark:text-slate-500 font-bold active:scale-125 transition-all w-5 h-5 flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center text-slate-300 dark:text-slate-700">
            <span className="material-symbols-outlined text-6xl block mb-4 opacity-50">shopping_cart</span>
            <p className="text-sm font-bold">购物车空空如也</p>
            <button onClick={() => navigate('/shop')} className="mt-6 px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm shadow-lg dark:shadow-none active:scale-95 transition-all">去逛逛</button>
          </div>
        )}
      </main>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 pb-10 z-[100] flex items-center justify-between shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">总计金额</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-red-500">¥</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{totalPrice}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="px-10 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl dark:shadow-none active:scale-95 transition-all">去结算 ({cartItems.length})</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
