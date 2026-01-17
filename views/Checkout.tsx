
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, CURRENT_USER } from '../constants';
import { Order } from '../types';

interface AddressInfo {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
}

// 模拟级联地区数据
const REGION_HIERARCHY: Record<string, Record<string, string[]>> = {
  '广东省': {
    '深圳市': ['龙华区', '南山区', '福田区', '宝安区', '龙岗区', '罗湖区'],
    '东莞市': ['长安镇', '虎门镇', '南城街道', '厚街镇'],
    '广州市': ['天河区', '越秀区', '番禺区', '海珠区'],
  },
  '湖南省': {
    '长沙市': ['芙蓉区', '天心区', '岳麓区', '开福区'],
    '衡阳市': ['雁峰区', '石鼓区', '珠晖区'],
  },
  '四川省': {
    '成都市': ['武侯区', '锦江区', '青羊区', '金牛区'],
    '绵阳市': ['涪城区', '游仙区'],
  }
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // 地址状态
  const [address, setAddress] = useState<AddressInfo>(() => {
    const saved = localStorage.getItem('outdog_shipping_address');
    return saved ? JSON.parse(saved) : {
      name: CURRENT_USER.name,
      phone: '13812345678',
      province: '广东省',
      city: '深圳市',
      district: '龙华区',
      detail: '龙华街道 某工业园宿舍楼 302'
    };
  });

  // 编辑地址弹窗状态
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState<AddressInfo>({ ...address });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('outdog_cart') || '[]');
    const items = cart.map((item: any) => {
      const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
      return { ...product, quantity: item.quantity };
    }).filter((p: any) => p.id);
    setCartItems(items);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 级联选择逻辑
  const availableProvinces = Object.keys(REGION_HIERARCHY);
  const availableCities = useMemo(() => {
    return tempAddress.province ? Object.keys(REGION_HIERARCHY[tempAddress.province] || {}) : [];
  }, [tempAddress.province]);
  const availableDistricts = useMemo(() => {
    return (tempAddress.province && tempAddress.city) 
      ? (REGION_HIERARCHY[tempAddress.province][tempAddress.city] || []) 
      : [];
  }, [tempAddress.province, tempAddress.city]);

  const handleSaveAddress = () => {
    const { name, phone, province, city, district, detail } = tempAddress;
    
    // 必填项校验
    if (!name.trim()) return alert('请输入收货人姓名');
    if (!phone.trim()) return alert('请输入联系电话');
    if (!/^1[3-9]\d{9}$/.test(phone)) return alert('请输入正确的手机号');
    if (!province) return alert('请选择省份');
    if (!city) return alert('请选择城市');
    if (!district) return alert('请选择区/县');
    
    // 详细地址长度限制
    if (detail.trim().length < 5) return alert('详细地址太短了，请至少输入5个字');
    if (detail.trim().length > 100) return alert('详细地址太长了，请控制在100字以内');

    setAddress(tempAddress);
    localStorage.setItem('outdog_shipping_address', JSON.stringify(tempAddress));
    setShowEditAddress(false);
  };

  const handlePay = () => {
    if (cartItems.length === 0) return;
    setIsPaying(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        status: 'processing',
        totalAmount: total,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          price: item.price,
          quantity: item.quantity,
          spec: item.specs?.[0] || '默认规格'
        })),
        trackingNumber: `SF${Math.floor(Math.random() * 1000000000)}`
      };

      const savedOrders = JSON.parse(localStorage.getItem('outdog_orders') || '[]');
      localStorage.setItem('outdog_orders', JSON.stringify([newOrder, ...savedOrders]));

      setIsPaying(false);
      setIsSuccess(true);
      localStorage.setItem('outdog_cart', '[]');
      window.dispatchEvent(new Event('storage'));
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center p-6 animate-in zoom-in-95 transition-colors">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="material-symbols-outlined text-5xl">check</span>
        </div>
        <h2 className="text-2xl font-black dark:text-white mb-2">支付成功！</h2>
        <p className="text-slate-400 text-sm text-center mb-10">订单已收到，我们将在 24 小时内为您发货。</p>
        <div className="w-full space-y-3">
          <button onClick={() => navigate('/profile')} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl transition">查看我的订单</button>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl font-black transition">回社区看看</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-32 transition-colors">
      <header className="px-5 py-4 bg-white dark:bg-slate-900 sticky top-0 z-50 flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-white"><span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span></button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold dark:text-white tracking-tight">确认订单</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* 收货地址入口 */}
        <section 
          onClick={() => { setTempAddress({ ...address }); setShowEditAddress(true); }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-slate-400">location_on</span>
              <span className="text-base font-black dark:text-white">{address.name} <span className="text-sm font-normal text-slate-400 ml-1">{address.phone}</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pl-8">{address.province} {address.city} {address.district} {address.detail}</p>
          </div>
          <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </section>

        {/* 商品清单 */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">商品清单</h3>
          {cartItems.map(item => (
            <div key={`${item.id}-${item.spec}`} className="flex gap-4">
              <img src={item.image} className="w-16 h-16 rounded-xl object-cover bg-slate-50 dark:bg-slate-800" alt="" />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-bold dark:text-white truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{item.spec || '默认规格'} x{item.quantity}</p>
              </div>
              <div className="text-right flex flex-col justify-center">
                <span className="text-sm font-black dark:text-white">¥{item.price}</span>
              </div>
            </div>
          ))}
          {cartItems.length === 0 && <p className="text-sm text-slate-400 text-center py-4">购物车是空的</p>}
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-bold">商品总额</span>
            <span className="text-sm font-bold dark:text-white">¥{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-400 font-bold">配送费用</span>
            <span className="text-xs text-green-500 font-bold">免运费</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
            <span className="text-sm font-black dark:text-white">应付金额</span>
            <span className="text-xl font-black text-red-500 tracking-tighter">¥{total.toFixed(2)}</span>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-6 py-4 pb-10 z-[60] flex items-center justify-between shadow-2xl transition-colors">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-black uppercase">实付款</span>
          <span className="text-2xl font-black text-red-500 tracking-tighter">¥{total.toFixed(2)}</span>
        </div>
        <button 
          onClick={handlePay} 
          disabled={isPaying || cartItems.length === 0} 
          className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isPaying ? <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div> : '立即支付'}
        </button>
      </footer>

      {/* 修改地址弹窗 */}
      {showEditAddress && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white dark:bg-slate-900 z-10 py-2">
              <h3 className="text-xl font-black dark:text-white">修改收货地址</h3>
              <button onClick={() => setShowEditAddress(false)} className="p-2"><span className="material-symbols-outlined dark:text-white">close</span></button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    收货人
                  </label>
                  <input 
                    type="text" 
                    value={tempAddress.name}
                    onChange={e => setTempAddress({...tempAddress, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-slate-200 transition-all"
                    placeholder="姓名"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    联系电话
                  </label>
                  <input 
                    type="tel" 
                    value={tempAddress.phone}
                    onChange={e => setTempAddress({...tempAddress, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-slate-200 transition-all"
                    placeholder="手机号"
                  />
                </div>
              </div>

              {/* 级联选择区域 */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    省份
                  </label>
                  <select 
                    value={tempAddress.province}
                    onChange={e => {
                      setTempAddress({
                        ...tempAddress, 
                        province: e.target.value,
                        city: '',
                        district: ''
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-slate-200 transition-all appearance-none"
                  >
                    <option value="" disabled>请选择省份</option>
                    {availableProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className={`space-y-1.5 transition-opacity duration-300 ${!tempAddress.province ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    城市
                  </label>
                  <select 
                    value={tempAddress.city}
                    onChange={e => {
                      setTempAddress({
                        ...tempAddress, 
                        city: e.target.value,
                        district: ''
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-slate-200 transition-all appearance-none"
                  >
                    <option value="" disabled>请选择城市</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className={`space-y-1.5 transition-opacity duration-300 ${!tempAddress.city ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    区/县/镇
                  </label>
                  <select 
                    value={tempAddress.district}
                    onChange={e => setTempAddress({...tempAddress, district: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-slate-200 transition-all appearance-none"
                  >
                    <option value="" disabled>请选择地区</option>
                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    详细地址
                  </label>
                  <span className={`text-[10px] font-bold ${tempAddress.detail.length < 5 || tempAddress.detail.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>
                    {tempAddress.detail.length}/100
                  </span>
                </div>
                <textarea 
                  value={tempAddress.detail}
                  onChange={e => setTempAddress({...tempAddress, detail: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-slate-200 transition-all resize-none"
                  placeholder="请输入街道门牌号、宿舍楼等详细信息（5-100字）"
                />
              </div>

              <button 
                onClick={handleSaveAddress}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-base shadow-xl mt-4 active:scale-95 transition-all"
              >
                保存地址
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
