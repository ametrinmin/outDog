
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER, MOCK_POSTS, MOCK_ORDERS } from '../constants';
import { OrderStatus, Order } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'history' | 'orders'>('posts');
  const [user, setUser] = useState(CURRENT_USER);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 加载用户信息
    const savedUser = localStorage.getItem('outdog_user_info');
    if (savedUser) setUser(JSON.parse(savedUser));

    // 加载并初始化订单数据
    const savedOrders = localStorage.getItem('outdog_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      localStorage.setItem('outdog_orders', JSON.stringify(MOCK_ORDERS));
      setOrders(MOCK_ORDERS);
    }
  }, [activeTab]);

  const myPosts = useMemo(() => MOCK_POSTS.filter(p => p.author.name === user.name), [user.name]);
  const likedPosts = useMemo(() => {
    const likedIds = JSON.parse(localStorage.getItem('outdog_liked_posts') || '[]');
    return MOCK_POSTS.filter(p => likedIds.includes(p.id));
  }, []);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { text: '待支付', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' };
      case 'processing': return { text: '处理中', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' };
      case 'shipped': return { text: '待收货', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' };
      case 'delivered': return { text: '已完成', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' };
      case 'cancelled': return { text: '已取消', color: 'text-slate-400 bg-slate-50 dark:bg-slate-900/20' };
      case 'refunded': return { text: '已退款', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' };
    }
  };

  const renderContent = () => {
    if (activeTab === 'orders') {
      if (orders.length === 0) return (
        <div className="py-20 text-center animate-in fade-in">
          <span className="material-symbols-outlined text-4xl text-slate-100 dark:text-slate-800 block mb-2">local_shipping</span>
          <p className="text-slate-300 dark:text-slate-700 text-sm">暂无订单记录</p>
        </div>
      );
      return (
        <div className="space-y-4 pt-5 animate-in fade-in slide-in-from-bottom-2 pb-24">
          {orders.map((order) => {
            const status = getStatusLabel(order.status);
            return (
              <div 
                key={order.id} 
                onClick={() => navigate(`/order/${order.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card dark:shadow-none border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">{order.id}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${status.color}`}>{status.text}</span>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img src={item.productImage} className="w-14 h-14 rounded-xl object-cover bg-slate-50 dark:bg-slate-800" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.productName}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.spec} x{item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">¥{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-300 dark:text-slate-700 font-medium">{order.timestamp}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">总计:</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">¥{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const list = activeTab === 'posts' ? myPosts : activeTab === 'likes' ? likedPosts : [];
    return (
      <div className="space-y-3 pt-5 animate-in fade-in slide-in-from-bottom-2">
        {list.map((post: any) => (
          <article key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-card dark:shadow-none border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.98] transition-all">
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug mb-1">{post.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">{post.content}</p>
            <div className="flex items-center justify-between mt-3 pt-1 border-t border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-tight">
                <span>{post.timestamp}</span>
                <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">chat_bubble_outline</span> {post.comments}</span>
                <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">favorite_border</span> {post.likes}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 bg-background-light dark:bg-slate-950 min-h-screen transition-colors overflow-x-hidden">
      <header className="px-5 py-3 bg-white dark:bg-slate-900 sticky top-0 z-40 backdrop-blur-md flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-lg font-bold dark:text-white">个人中心</h1>
        <button onClick={() => navigate('/settings')} className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <section className="bg-white dark:bg-slate-900 pt-6 px-6">
        <div className="flex items-start gap-4">
          <img src={user.avatar} className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-sm" alt="" />
          <div className="flex-1 pt-2">
            <h2 className="text-xl font-black dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{user.bio}</p>
          </div>
        </div>
        <div className="flex justify-around mt-8 pb-6 border-b border-slate-50 dark:border-slate-800">
          <div className="text-center flex-1">
            <div className="text-xl font-black dark:text-white">{user.following}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">关注</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xl font-black dark:text-white">{(user.followers / 1000).toFixed(1)}k</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">粉丝</div>
          </div>
        </div>
      </section>

      <div className="sticky top-[52px] z-30 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-50 dark:border-slate-800">
        <div className="flex w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'posts', label: '我的发帖' },
            { id: 'likes', label: '我的点赞' },
            { id: 'orders', label: '我的订单' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 min-w-[100px] py-3 text-sm transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'font-bold text-slate-900 dark:text-white border-slate-900 dark:border-white' 
                  : 'font-medium text-slate-400 dark:text-slate-600 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <main className="px-5">{renderContent()}</main>
    </div>
  );
};

export default Profile;
