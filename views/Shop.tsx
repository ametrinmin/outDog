
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCartData = () => {
      const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
      
      const items = cart.slice(-3).map((item: any) => {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
        return { ...product, quantity: item.quantity };
      }).reverse();
      setCartItems(items);
    };
    updateCartData();
    window.addEventListener('storage', updateCartData);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(e.target as Node) && 
          cartIconRef.current && !cartIconRef.current.contains(e.target as Node)) {
        setShowCartPreview(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', updateCartData);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const triggerFlyAnimation = (startRect: DOMRect) => {
    if (!cartIconRef.current) return;
    const endRect = cartIconRef.current.getBoundingClientRect();
    
    // 创建容器
    const container = document.createElement('div');
    container.className = 'fly-dot-container';
    
    // 创建小圆点
    const dot = document.createElement('div');
    dot.className = 'fly-dot';
    container.appendChild(dot);
    
    // 设置初始绝对位置
    const startX = startRect.left + startRect.width / 2 - 7;
    const startY = startRect.top + startRect.height / 2 - 7;
    
    container.style.transform = `translate(${startX}px, 0)`;
    dot.style.transform = `translate(0, ${startY}px)`;
    
    document.body.appendChild(container);
    
    // 强制回流以启动 transition
    void container.offsetWidth;

    // 计算终点相对起始点的位移
    const moveX = endRect.left + endRect.width / 2 - 7;
    const moveY = endRect.top + endRect.height / 2 - 7;

    // 触发动画
    requestAnimationFrame(() => {
      // 容器水平匀速移动到目标 X
      container.style.transform = `translate(${moveX}px, 0)`;
      // 小点垂直方向按贝塞尔曲线移动到目标 Y
      dot.style.transform = `translate(0, ${moveY}px) scale(0.5)`;
      dot.style.opacity = '0.5';
    });

    // 动画结束后的清理和购物车跳动反馈
    setTimeout(() => {
      container.remove();
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }, 800);
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    triggerFlyAnimation(target.getBoundingClientRect());
    setAddingId(productId);
    
    const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === productId);
    if (existingItem) existingItem.quantity += 1; else cart.push({ productId, quantity: 1 });
    
    localStorage.setItem('outdog_cart', JSON.stringify(cart));
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setAddingId(null), 1500);
    }, 100);
  };

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm z-[100] flex items-center justify-between px-6 py-4 transition-colors">
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">周边商城</h1>
        <div className="relative">
          <button 
            ref={cartIconRef} 
            onClick={() => setShowCartPreview(!showCartPreview)} 
            className={`p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition relative text-slate-900 dark:text-white ${isJumping ? 'animate-cart-jump' : ''}`}
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {cartCount > 0 && <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">{cartCount > 99 ? '99+' : cartCount}</span>}
          </button>

          {showCartPreview && (
            <div ref={previewRef} className="absolute right-0 top-12 w-64 bg-white/95 dark:bg-slate-900/95 dropdown-blur rounded-2xl shadow-dropdown border border-slate-100 dark:border-slate-800 p-4 z-[110] animate-fade-in-up">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">最近加入</h4>
              {cartItems.length > 0 ? (
                <div className="space-y-3">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-slate-50 dark:bg-slate-800" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-red-500 font-black">¥{item.price} <span className="text-slate-400 font-medium ml-1">x{item.quantity}</span></p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/cart')} className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider mt-2 active:scale-95 transition">查看全部购物车</button>
                </div>
              ) : (
                <div className="text-center py-4"><p className="text-[11px] text-slate-400 font-bold">购物车是空的</p></div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-[68px] pb-40"> 
        <div className="space-y-4 pt-4">
          {MOCK_PRODUCTS.map((product) => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="group bg-white dark:bg-slate-900 overflow-hidden active:scale-[0.99] transition-all cursor-pointer border-y border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-90 dark:opacity-80" />
                {product.badge && (
                  <div className="absolute top-6 left-6">
                    <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl tracking-widest uppercase">{product.badge}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">工友专属</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{product.specs?.[0]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span className="text-sm font-bold text-red-500">¥</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{product.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={(e) => handleAddToCart(e, product.id)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border flex items-center justify-center gap-2 ${addingId === product.id ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-100 dark:shadow-none animate-success-pop' : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-100 dark:border-slate-700 active:bg-slate-100 dark:active:bg-slate-700'}`}>
                    {addingId === product.id ? <><span className="material-symbols-outlined text-lg">check_circle</span><span>已加入</span></> : '加入购物车'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/cart'); }} className="flex-[1.5] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all">立即抢购</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Shop;
