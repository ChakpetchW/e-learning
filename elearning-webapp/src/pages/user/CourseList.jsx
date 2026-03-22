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
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-[15px] font-medium placeholder-gray-400"
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
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeCat === cat.name 
                ? 'bg-primary text-white shadow-md shadow-primary/30' 
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
              className="card flex md:flex-col overflow-hidden cursor-pointer hover:border-primary/50 transition-all border border-gray-100 group bg-white h-full"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-full md:h-48 overflow-hidden shrink-0">
                 <img src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
                 </div>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider w-full truncate pr-2">{course.category?.name || 'Uncategorized'}</p>
                    {course.isEnrolled && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${course.enrollmentStatus === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {course.enrollmentStatus === 'COMPLETED' ? 'จบแล้ว' : 'กำลังเรียน'}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">{course.title}</h4>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-y-2 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                    <Clock size={12} className="text-gray-400" /> {course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || '2'}h
                  </span>
                  <span className="text-xs font-black text-warning flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                    <Star size={12} className="fill-warning border-none text-warning" /> {course.points}
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
