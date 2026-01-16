
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';

const Shop: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
      <nav className="flex items-center justify-between px-6 py-4 sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <span className="material-icons-outlined text-3xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-xl font-bold tracking-wide">周边</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition relative">
          <span className="material-icons-outlined text-3xl">shopping_cart</span>
          <span className="absolute top-2 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </nav>

      <main className="px-5 pb-8 flex flex-col">
        <div className="mb-6 mt-4">
          <h2 className="text-2xl font-bold">精选工友定制</h2>
          <p className="text-sm text-slate-500 mt-1">为专业人士打造的高品质装备</p>
        </div>

        <div className="space-y-6">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="group bg-white rounded-3xl shadow-soft overflow-hidden border border-gray-100 flex flex-col active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                  <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-lg">
                    <span className="material-icons-round text-white text-4xl ml-1">play_arrow</span>
                  </div>
                </div>
                {product.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-100 shadow-sm text-gray-700">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-600">
                    工友专属
                  </span>
                  <span className="text-xs text-slate-500 px-2 border-l border-gray-300">
                    {product.specs?.[1]}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-red-500">¥</span>
                    <span className="text-4xl font-bold tracking-tight">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through ml-2">¥{product.originalPrice}</span>
                    )}
                  </div>
                  <button className="bg-slate-900 text-white rounded-full p-4 shadow-lg active:scale-90 transition-transform">
                    <span className="material-icons-outlined">add_shopping_cart</span>
                  </button>
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
