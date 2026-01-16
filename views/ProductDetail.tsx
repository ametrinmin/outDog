
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.id === id);

  if (!product) return <div className="p-10 text-center">商品不存在</div>;

  return (
    <div className="bg-slate-50 min-h-screen animate-in slide-in-from-bottom duration-300 pb-24">
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-40 border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 transition">
          <span className="material-icons-outlined text-2xl text-slate-700">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold">商品详情</h1>
        <button className="p-2 rounded-full hover:bg-slate-100 transition relative">
          <span className="material-icons-outlined text-2xl text-blue-500">shopping_cart</span>
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      <div className="w-full aspect-square bg-white relative">
        <img src={product.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center pl-1 border border-white/50">
            <span className="material-icons-outlined text-white text-4xl">play_arrow</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 -mt-4 relative z-10 rounded-t-3xl bg-white shadow-soft space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">¥{product.price}</span>
            <span className="text-sm text-slate-400 line-through mb-1">¥{product.originalPrice}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span className="material-icons-outlined text-sm">local_shipping</span>
            <span>免运费</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{product.name} | 全套专业装备</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600">工友专属</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">现货速发</span>
          </div>
        </div>
      </div>

      <div className="mt-3 mx-4 bg-white rounded-xl p-4 space-y-4 shadow-sm border border-slate-50">
        <div className="flex justify-between items-center cursor-pointer group">
          <div className="flex gap-4">
            <span className="text-slate-400 font-medium">规格</span>
            <span className="text-slate-800 font-medium">{product.specs?.[0]}</span>
          </div>
          <span className="material-icons-outlined text-slate-300 group-hover:text-blue-500">chevron_right</span>
        </div>
        <div className="h-px bg-slate-100 w-full"></div>
        <div className="flex justify-between items-center cursor-pointer group">
          <div className="flex gap-4">
            <span className="text-slate-400 font-medium">送至</span>
            <div className="flex flex-col">
              <span className="text-slate-800 font-medium flex items-center gap-1">
                <span className="material-icons-outlined text-sm text-blue-500">location_on</span>
                广东省 广州市 天河区
              </span>
              <span className="text-xs text-slate-500 mt-0.5">预计 3 天内送达</span>
            </div>
          </div>
          <span className="material-icons-outlined text-slate-300 group-hover:text-blue-500">chevron_right</span>
        </div>
      </div>

      <div className="mt-6 bg-white pb-8">
        <div className="flex items-center justify-center py-6 border-b border-slate-100 mb-4">
          <div className="h-px w-8 bg-slate-300"></div>
          <span className="mx-4 text-sm font-bold text-slate-500">商品详情</span>
          <div className="h-px w-8 bg-slate-300"></div>
        </div>
        <div className="px-4 space-y-6">
          <p className="text-slate-600 leading-relaxed">{product.description}</p>
          <div className="space-y-3">
            {product.detailImages?.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-4 py-3 pb-8 z-50 flex items-center justify-between gap-4">
        <div className="flex gap-6 px-2">
          <button className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-500">
            <span className="material-icons-outlined text-2xl">headset_mic</span>
            <span className="text-[10px]">客服</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-500">
            <span className="material-icons-outlined text-2xl">favorite_border</span>
            <span className="text-[10px]">收藏</span>
          </button>
        </div>
        <div className="flex-1 flex gap-2">
          <button className="flex-1 py-2.5 rounded-full bg-blue-50 text-blue-500 font-bold text-sm shadow-sm">加入购物车</button>
          <button className="flex-1 py-2.5 rounded-full bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-100">立即购买</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
