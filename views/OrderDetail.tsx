
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderStatus, Order } from '../types';

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('outdog_orders') || '[]');
    const currentOrder = savedOrders.find((o: Order) => o.id === id);
    if (currentOrder) setOrder(currentOrder);
  }, [id]);

  const updateOrderStatus = (newStatus: OrderStatus, extraData: Partial<Order> = {}) => {
    const savedOrders = JSON.parse(localStorage.getItem('outdog_orders') || '[]');
    const updatedOrders = savedOrders.map((o: Order) => 
      o.id === id ? { ...o, status: newStatus, ...extraData } : o
    );
    localStorage.setItem('outdog_orders', JSON.stringify(updatedOrders));
    setOrder(prev => prev ? { ...prev, status: newStatus, ...extraData } : null);
    
    // 触发 storage 事件让 Profile 页面也能实时更新
    window.dispatchEvent(new Event('storage'));
  };

  const handleConfirmReceipt = () => {
    if (window.confirm('确认已收到商品吗？')) {
      updateOrderStatus('delivered');
      alert('收货成功！快去评价商品吧~');
    }
  };

  const handleReviewSubmit = () => {
    if (!reviewText.trim()) return alert('请输入评价内容');
    const review = {
      rating,
      content: reviewText,
      tags: rating >= 4 ? ['物流快', '质量好', '五星好评'] : ['一般般'],
      timestamp: new Date().toLocaleString()
    };
    updateOrderStatus('delivered', { review });
    setShowReviewModal(false);
    alert('评价成功！');
  };

  const handleRefundSubmit = () => {
    if (!refundReason) return alert('请选择退款原因');
    updateOrderStatus('refunded', { refundReason });
    setShowRefundModal(false);
    alert('售后申请已提交，款项将原路退回（模拟成功）');
  };

  // 动态物流追踪节点 - 移到早起返回之前以符合 Hook 规则
  const trackingNodes = useMemo(() => {
    if (!order) return [];
    const base = [
      { time: order.timestamp, title: '订单已创建', desc: '等待付款', active: true }
    ];
    if (order.status === 'processing') {
      base.unshift({ time: '刚刚', title: '待发货', desc: '包裹正在等待快递员揽收', active: true });
    }
    if (order.status === 'shipped' || order.status === 'delivered') {
      base.unshift({ time: '10:30', title: '运输中', desc: '包裹已到达 [深圳市龙华转运中心]', active: order.status === 'shipped' });
      if (order.status === 'delivered') {
        base.unshift({ time: '刚刚', title: '已签收', desc: '您的包裹已由本人签收。如有疑问请联系快递员', active: true });
      }
    }
    return base;
  }, [order?.status, order?.timestamp]);

  if (!order) return <div className="p-10 text-center dark:text-white">订单不存在</div>;

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { label: '等待买家付款', icon: 'payments', desc: '请尽快支付，逾期订单将自动关闭' };
      case 'processing': return { label: '仓库处理中', icon: 'package_2', desc: '商家正在紧张备货中' };
      case 'shipped': return { label: '包裹运送中', icon: 'local_shipping', desc: '快递小哥正快马加鞭赶往您的地址' };
      case 'delivered': return { label: '订单已完成', icon: 'task_alt', desc: '感谢您的支持，期待再次光临' };
      case 'cancelled': return { label: '订单已关闭', icon: 'cancel', desc: '订单已于系统自动取消' };
      case 'refunded': return { label: '售后完成', icon: 'replay', desc: '款项已原路退回' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen animate-in slide-in-from-right duration-300 pb-32 transition-colors">
      <header className="px-5 py-3 bg-white dark:bg-slate-900 sticky top-0 z-50 flex items-center border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-slate-600 dark:text-white active:scale-90">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center mr-6 text-lg font-bold dark:text-white tracking-tight">订单详情</h1>
      </header>

      {/* 状态看板 */}
      <section className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-8 flex items-center justify-between transition-colors">
        <div>
          <h2 className="text-xl font-black mb-1">{statusInfo.label}</h2>
          <p className="text-xs opacity-70 font-medium">{statusInfo.desc}</p>
        </div>
        <span className="material-symbols-outlined text-5xl opacity-80">{statusInfo.icon}</span>
      </section>

      <main className="p-4 space-y-4 -mt-4">
        {/* 物流实时追踪 */}
        {(order.status === 'shipped' || order.status === 'delivered' || order.status === 'processing') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-card dark:shadow-none border border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">timeline</span>
              物流追踪
            </h3>
            <div className="space-y-6 pl-2">
              {trackingNodes.map((node, i) => (
                <div key={i} className="relative flex gap-4">
                  {i !== trackingNodes.length - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-[-24px] w-[1px] bg-slate-100 dark:bg-slate-800"></div>
                  )}
                  <div className={`z-10 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 shrink-0 mt-1 ${node.active ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'}`}>
                    {node.active && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full m-auto mt-[1px] animate-pulse"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${node.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{node.title}</p>
                    <p className={`text-xs mt-1 ${node.active ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-700'}`}>{node.desc}</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-800 mt-1">{node.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-card dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <img src={item.productImage} className="w-16 h-16 rounded-xl object-cover bg-slate-50 dark:bg-slate-800" alt="" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-[15px] font-bold dark:text-white truncate">{item.productName}</h4>
                  <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{item.spec}</p>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <p className="text-sm font-black dark:text-white">¥{item.price}</p>
                  <p className="text-[10px] text-slate-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
            <span className="text-sm font-black dark:text-white">实付款</span>
            <span className="text-lg font-black text-red-500 tracking-tighter">¥{order.totalAmount}</span>
          </div>
        </section>

        {order.review && (
          <section className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/20">
            <h3 className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">stars</span>
              我的评价
            </h3>
            <div className="flex gap-0.5 mb-2">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`material-symbols-outlined text-[16px] ${s <= order.review!.rating ? 'text-amber-400 FILL-1' : 'text-slate-200'}`}>star</span>
              ))}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">"{order.review.content}"</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {order.review.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[10px] text-amber-600 border border-amber-100 dark:border-amber-900/50 font-bold">{t}</span>
              ))}
            </div>
          </section>
        )}

        {/* 操作栏 */}
        <div className="flex gap-3 pt-4">
          {order.status === 'shipped' && (
            <button onClick={handleConfirmReceipt} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">确认收货</button>
          )}
          {order.status === 'delivered' && !order.review && (
            <>
              <button onClick={() => setShowRefundModal(true)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm">售后申请</button>
              <button onClick={() => setShowReviewModal(true)} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">发表评价</button>
            </>
          )}
          {order.status === 'delivered' && order.review && (
            <button onClick={() => setShowRefundModal(true)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm">申请售后</button>
          )}
          {order.status === 'refunded' && (
            <div className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center text-xs text-slate-400 font-bold border dark:border-slate-800">
              售后申请已处理完成，退款原路退回中
            </div>
          )}
        </div>
      </main>

      {/* 评价弹窗 */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black dark:text-white">评价商品</h3>
              <button onClick={() => setShowReviewModal(false)} className="p-2"><span className="material-symbols-outlined dark:text-white">close</span></button>
            </div>
            <div className="flex justify-center gap-3 mb-8">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`material-symbols-outlined text-4xl transition-all ${s <= rating ? 'text-amber-400 scale-110 FILL-1' : 'text-slate-200'}`}>star</button>
              ))}
            </div>
            <textarea 
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm dark:text-white mb-6 focus:ring-2 focus:ring-slate-200 transition-all" 
              placeholder="分享一下你的使用感受，帮助更多工友参考..." 
              rows={4}
            />
            <button onClick={handleReviewSubmit} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all">提交评价</button>
          </div>
        </div>
      )}

      {/* 售后弹窗 */}
      {showRefundModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black dark:text-white">申请售后</h3>
              <button onClick={() => setShowRefundModal(false)} className="p-2"><span className="material-symbols-outlined dark:text-white">close</span></button>
            </div>
            <div className="space-y-3 mb-8">
              {['不喜欢/效果不好', '质量问题', '包装破损', '商家发错货', '少件/漏发'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => setRefundReason(reason)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-bold transition-all ${refundReason === reason ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-500 shadow-sm' : 'border-slate-100 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={handleRefundSubmit} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">确认并提交申请</button>
          </div>
        </div>
      )}
      
      <style>{`
        .FILL-1 { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
};

export default OrderDetail;
