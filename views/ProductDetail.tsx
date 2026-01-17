
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product?.specs?.length) setSelectedSpec(product.specs[0]);
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
  }, [product]);

  const updateCartData = () => {
    const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
    const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(count);
    const items = cart.slice(-3).map((item: any) => {
      const p = MOCK_PRODUCTS.find(prod => prod.id === item.productId);
      return { ...p, quantity: item.quantity };
    }).reverse();
    setCartItems(items);
  };

  const totalPrice = useMemo(() => product ? (product.price * quantity).toFixed(2) : 0, [product, quantity]);

  const triggerFlyAnimation = (startRect: DOMRect) => {
    if (!cartIconRef.current) return;
    const endRect = cartIconRef.current.getBoundingClientRect();
    
    const container = document.createElement('div');
    container.className = 'fly-dot-container';
    const dot = document.createElement('div');
    dot.className = 'fly-dot';
    container.appendChild(dot);
    
    const startX = startRect.left + startRect.width / 2 - 7;
    const startY = startRect.top + startRect.height / 2 - 7;
    
    container.style.transform = `translate(${startX}px, 0)`;
    dot.style.transform = `translate(0, ${startY}px)`;
    
    document.body.appendChild(container);
    void container.offsetWidth;

    const moveX = endRect.left + endRect.width / 2 - 7;
    const moveY = endRect.top + endRect.height / 2 - 7;

    requestAnimationFrame(() => {
      container.style.transform = `translate(${moveX}px, 0)`;
      dot.style.transform = `translate(0, ${moveY}px) scale(0.5)`;
      dot.style.opacity = '0.5';
    });

    setTimeout(() => {
      container.remove();
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }, 800);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/shop');
    }
  };

  if (!product) return <div className="p-10 text-center dark:text-white">商品不存在</div>;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      const target = e.currentTarget as HTMLElement;
      triggerFlyAnimation(target.getBoundingClientRect());
    }
    
    setIsAdding(true);
    const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === product.id && item.spec === selectedSpec);
    if (existingItem) existingItem.quantity += quantity; else cart.push({ productId: product.id, quantity: quantity, spec: selectedSpec });
    localStorage.setItem('outdog_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen animate-in slide-in-from-bottom duration-300 pb-40 transition-colors">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-50 dark:border-slate-800 z-[100] flex items-center justify-between px-4 py-3 transition-colors">
        <button onClick={handleBack} className="p-2 text-slate-700 dark:text-white active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-black dark:text-white tracking-tight">商品详情</h1>
        <div className="relative">
          <button 
            ref={cartIconRef} 
            onClick={() => setShowCartPreview(!showCartPreview)} 
            className={`p-2 text-slate-900 dark:text-white relative active:scale-95 transition ${isJumping ? 'animate-cart-jump' : ''}`}
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
      </header>

      <div className="pt-[52px] w-full aspect-square bg-white dark:bg-slate-800 transition-colors overflow-hidden">
        <img src={product.image} alt="" className="w-full h-full object-cover opacity-95 dark:opacity-85" />
      </div>

      <div className="px-5 py-8 -mt-6 relative z-10 rounded-t-[32px] bg-white dark:bg-slate-900 shadow-soft space-y-8 transition-colors">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-red-500 italic">¥</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{product.price}</span>
            <span className="text-sm text-slate-400 dark:text-slate-600 line-through">¥{product.originalPrice}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">现货速发</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 tracking-tight">{product.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{product.description}</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-black dark:text-white">选择规格</h3>
          <div className="flex flex-wrap gap-2">
            {product.specs?.map((spec) => (
              <button key={spec} onClick={() => setSelectedSpec(spec)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedSpec === spec ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'}`}>{spec}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-black dark:text-white">购买数量</h3>
          <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 border dark:border-slate-800"><span className="material-symbols-outlined text-lg">remove</span></button>
            <span className="text-lg font-black dark:text-white min-w-[20px] text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 border dark:border-slate-800"><span className="material-symbols-outlined text-lg">add</span></button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 pb-10 z-[100] flex items-center justify-between gap-6 transition-colors shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 dark:text-slate-600 font-black tracking-widest uppercase mb-0.5">合计金额</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-red-500">¥</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{totalPrice}</span>
          </div>
        </div>
        <div className="flex flex-1 gap-2">
          <button onClick={handleAddToCart} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${isAdding ? 'bg-green-500 text-white animate-success-pop' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'}`}>{isAdding ? '已加入' : '加入购物车'}</button>
          <button onClick={() => { handleAddToCart(); navigate('/cart'); }} className="flex-[1.5] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">立即抢购</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
