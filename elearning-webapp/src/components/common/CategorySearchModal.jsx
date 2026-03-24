import React, { useState, useMemo } from 'react';
import { X, Search, Grid, Zap, Code, BarChart, PenTool, Layout, Database, Globe, Cpu, Hash, ArrowRight } from 'lucide-react';

const CategorySearchModal = ({ isOpen, onClose, categories, courses, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categoryIconMap = {
    'AI': Zap,
    'Artificial Intelligence': Zap,
    'Technology': Cpu,
    'IT': Cpu,
    'Business': BarChart,
    'Management': BarChart,
    'Design': PenTool,
    'Creative': PenTool,
    'Programming': Code,
    'Code': Code,
    'Development': Code,
    'Marketing': Globe,
    'Data': Database,
    'Web': Layout,
  };

  const getCategoryIcon = (name) => {
    const key = Object.keys(categoryIconMap).find(k => name.toLowerCase().includes(k.toLowerCase()));
    return categoryIconMap[key] || Hash;
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const getCourseCount = (catId) => {
    return courses.filter(c => c.categoryId === catId).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      <div className="bg-white w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden animate-slide-up ring-1 ring-black/5">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Grid className="text-primary" size={28} /> เลือกหมวดหมู่ที่สนใจ
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">ค้นหาจาก {categories.length} หมวดหมู่ทั้งหมดในระบบ</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 md:px-8 py-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={22} />
            </div>
            <input 
              type="text" 
              autoFocus
              placeholder="พิมพ์ชื่อหมวดหมู่ที่ต้องการค้นหา..." 
              className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-lg font-medium placeholder-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth no-scrollbar">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredCategories.map(cat => {
                const Icon = getCategoryIcon(cat.name);
                const count = getCourseCount(cat.id);
                return (
                  <button 
                    key={cat.id}
                    onClick={() => {
                        onSelect(cat.name);
                        onClose();
                    }}
                    className="group bg-white p-5 rounded-[1.75rem] border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all text-left flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                      <Icon size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-[1.05rem] group-hover:text-primary transition-colors leading-tight break-words">{cat.name}</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">{count} Courses</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-400">ไม่พบหมวดหมู่ที่ค้นหา</h3>
              <p className="max-w-xs mt-2 font-medium">ลองเปลี่ยนคำค้นหาหรือตัวเลือกระบบจะพยายามช่วยคุณหาครับ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySearchModal;
