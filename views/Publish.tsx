
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_POSTS, CURRENT_USER } from '../constants';
import { ContentBlock } from '../types';

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: 'b-init', type: 'text', value: '' }
  ]);
  const [location, setLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const availableLocations = ['广州市 天河区', '深圳市 龙华区', '东莞市 长安镇', '佛山市 顺德区', '上海市 浦东新区'];
  const availableCategories = ['工作互助', '薪资讨论', '法律咨询', '生活闲聊', '工具推荐', '安全教育'];

  // Handle Edit Mode Initial Data
  useEffect(() => {
    if (id) {
      const postToEdit = MOCK_POSTS.find(p => p.id === id);
      if (postToEdit) {
        setTitle(postToEdit.title);
        setSelectedCategories(postToEdit.categories);
        if (postToEdit.blocks && postToEdit.blocks.length > 0) {
          setBlocks(postToEdit.blocks);
        } else {
          setBlocks([
            { id: 'b-fallback', type: 'text', value: postToEdit.content },
            ...postToEdit.images.map((img, i) => ({ id: `img-${i}`, type: 'image' as const, value: img }))
          ]);
        }
      }
    }
  }, [id]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMediaBlocks: ContentBlock[] = Array.from(files).map((file: File) => ({
        id: `m-${Date.now()}-${Math.random()}`,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        value: URL.createObjectURL(file)
      }));
      
      setBlocks(prev => [
        ...prev, 
        ...newMediaBlocks,
        { id: `t-${Date.now()}`, type: 'text', value: '' }
      ]);
    }
  };

  const updateTextBlock = (id: string, value: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1 && blocks[0].type === 'text') return;
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handlePublish = () => {
    if (!title.trim() || blocks.every(b => b.type === 'text' && !b.value.trim())) {
      alert('请填写标题和内容');
      return;
    }
    if (selectedCategories.length === 0) {
      alert('请选择至少一个帖子类型');
      return;
    }

    const firstText = blocks.find(b => b.type === 'text' && b.value.trim())?.value || '';
    const allImages = blocks.filter(b => b.type === 'image').map(b => b.value);

    if (id) {
      // UPDATE MODE
      const index = MOCK_POSTS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_POSTS[index] = {
          ...MOCK_POSTS[index],
          title: title,
          content: firstText,
          blocks: blocks.filter(b => b.type !== 'text' || b.value.trim() !== ''),
          images: allImages,
          categories: selectedCategories,
        };
      }
    } else {
      // NEW POST MODE
      const newPost = {
        id: `p${Date.now()}`,
        author: { name: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
        title: title,
        content: firstText,
        blocks: blocks.filter(b => b.type !== 'text' || b.value.trim() !== ''),
        images: allImages,
        categories: selectedCategories,
        timestamp: '刚刚',
        likes: 0,
        comments: 0
      };
      MOCK_POSTS.unshift(newPost as any);
    }

    navigate('/');
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      }
      if (prev.length >= 2) {
        return prev; // Limit to 2
      }
      return [...prev, cat];
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 text-slate-400">
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>
        <h2 className="text-base font-bold text-slate-900">{id ? '编辑动态' : '发布动态'}</h2>
        <button 
          onClick={handlePublish}
          disabled={!title.trim() || selectedCategories.length === 0}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            title.trim() && selectedCategories.length > 0
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-slate-100 text-slate-400 pointer-events-none'
          }`}
        >
          {id ? '保存' : '发布'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-black text-slate-900 placeholder-slate-200 border-none focus:ring-0 p-0 bg-transparent" 
          placeholder="给你的分享起个标题..." 
          type="text" 
        />

        <div className="h-px bg-slate-100"></div>

        <div className="space-y-4">
          {blocks.map((block) => (
            <div key={block.id} className="relative group">
              {block.type === 'text' ? (
                <textarea 
                  value={block.value}
                  onChange={(e) => updateTextBlock(block.id, e.target.value)}
                  className="w-full text-base text-slate-600 placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed min-h-[40px]" 
                  placeholder="写点什么..."
                  rows={Math.max(1, block.value.split('\n').length)}
                />
              ) : block.type === 'image' ? (
                <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
                  <img src={block.value} alt="" className="w-full object-cover max-h-96" />
                  <button 
                    onClick={() => removeBlock(block.id)}
                    className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 group bg-black aspect-video flex items-center justify-center">
                  <video src={block.value} controls className="max-h-96 w-full" />
                  <button 
                    onClick={() => removeBlock(block.id)}
                    className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
            图片/视频
          </button>
          <button 
            onClick={() => setBlocks(prev => [...prev, { id: `t-${Date.now()}`, type: 'text', value: '' }])}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">text_fields</span>
            文字
          </button>
        </div>

        <div className="h-px bg-slate-50"></div>

        <div className="space-y-4">
          <button 
            onClick={() => setShowLocationPicker(true)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined ${location ? 'text-blue-500' : 'text-slate-400'}`}>location_on</span>
              <span className="text-sm text-slate-600">{location || '你在哪里？'}</span>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>
          
          <button 
            onClick={() => setShowCategoryPicker(true)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined ${selectedCategories.length > 0 ? 'text-orange-500' : 'text-slate-400'}`}>category</span>
              <div className="flex flex-col items-start">
                <span className="text-sm text-slate-600">
                  {selectedCategories.length > 0 ? selectedCategories.join(' / ') : '选择帖子类型'}
                </span>
                <span className="text-[10px] text-slate-400">最多可选 2 个</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="image/*,video/*" 
        onChange={handleMediaUpload} 
      />

      {showLocationPicker && (
        <div className="fixed inset-0 z-[110] bg-black/40 animate-in fade-in flex items-end">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">地点</h3>
              <button onClick={() => setShowLocationPicker(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="space-y-2">
              {availableLocations.map(loc => (
                <button key={loc} onClick={() => { setLocation(loc); setShowLocationPicker(false); }} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-slate-700">{loc}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCategoryPicker && (
        <div className="fixed inset-0 z-[110] bg-black/40 animate-in fade-in flex items-end">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <h3 className="font-bold">选择帖子类型</h3>
                <p className="text-[10px] text-slate-400">请选择 1-2 个分类</p>
              </div>
              <button onClick={() => setShowCategoryPicker(false)} className="text-slate-900 font-bold px-4 py-2 bg-slate-100 rounded-full text-sm">确定</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {availableCategories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => toggleCategory(cat)}
                  disabled={!selectedCategories.includes(cat) && selectedCategories.length >= 2}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategories.includes(cat) 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-500 border-slate-100'
                  } ${!selectedCategories.includes(cat) && selectedCategories.length >= 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publish;
