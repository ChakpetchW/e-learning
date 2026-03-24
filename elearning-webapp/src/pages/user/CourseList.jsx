import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Star, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, adminAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories()
        ]);
        setCourses(coursesRes.data);
        setCategories([{ id: 'ALL', name: 'All' }, ...catRes.data]);
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c => 
    (activeCat === 'All' || c.category?.name === activeCat) &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">คอร์สเรียนทั้งหมด</h2>
        <button className="text-gray-500 hover:text-primary transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-100"><Filter size={20} /></button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="ค้นหาคอร์สที่น่าสนใจ..." 
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-[15px] font-medium placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCat(cat.name)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeCat === cat.name 
                ? 'bg-primary text-white shadow-md shadow-primary/30 border border-transparent' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Course List Vertical to Grid */}
      <div className="flex flex-col items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-2 mb-6">
        {!loading && filtered.length > 0 ? (
          filtered.map(course => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              className="card flex md:flex-col overflow-hidden cursor-pointer group bg-white h-full shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] ring-1 ring-slate-100/80 border-none"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-full md:h-[190px] xl:h-[220px] shrink-0 md:p-3 md:pb-0">
                <div className="w-full h-full md:rounded-[1.25rem] overflow-hidden relative shadow-sm md:shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-slate-100">
                  <img src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  <div className="hidden md:flex absolute top-3 left-3 points-pill shadow-md glass !text-amber-700 border border-white/60">
                    <span className="opacity-80 text-[10px] mr-1">⭐</span>{course.points} Pts
                  </div>
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full glass-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <PlayCircle size={28} className="text-white ml-1" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-full truncate pr-2">{course.category?.name || 'Uncategorized'}</p>
                    {course.isEnrolled && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${course.enrollmentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50' : 'bg-primary/10 text-primary ring-1 ring-primary/20'}`}>
                        {course.enrollmentStatus === 'COMPLETED' ? 'จบแล้ว' : 'กำลังเรียน'}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-[1.05rem] text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h4>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-y-2 mt-4 pt-4 border-t border-slate-50">
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50/80 px-2.5 py-1.5 rounded-lg text-slate-600 ring-1 ring-slate-200/60">
                    <Clock size={14} className="text-slate-400" /> {course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || '2'}h
                  </span>
                  <span className="text-xs font-black text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg ring-1 ring-amber-200/60">
                    <Star size={14} className="fill-warning border-none text-warning" /> {course.points}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : !loading && (
          <div className="text-center py-12 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            <Search size={48} className="mb-3 text-gray-300" strokeWidth={1.5} />
            <p className="font-medium text-gray-500">ไม่พบคอร์สที่ค้นหา</p>
            <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;
