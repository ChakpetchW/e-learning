import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Star, PlayCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CompletedCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userAPI.getCourses();
        // Filter only completed courses
        const completed = response.data.filter(c => c.enrollmentStatus === 'COMPLETED');
        setCourses(completed);
      } catch (error) {
        console.error('Fetch completed courses error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">คอร์สที่เรียนจบแล้ว</h2>
          <p className="text-sm text-gray-500 font-medium">รวมผลงานและความสำเร็จทั้งหมดของคุณ</p>
        </div>
        <div className="bg-success/10 text-success p-3 rounded-2xl border border-success/20">
          <CheckCircle size={24} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="ค้นหาในคอร์สที่จบแล้ว..." 
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-[15px] font-medium placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && courses.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <CheckCircle size={32} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-600 text-lg">ยังไม่มีคอร์สที่เรียนจบ</p>
          <p className="text-sm mt-1 max-w-xs mx-auto">เรียนให้จบครบทุกบทเรียนเพื่อรับแต้มรางวัลและสะสมคอร์สที่นี่!</p>
          <button 
            onClick={() => navigate('/user/courses')}
            className="mt-6 btn btn-primary px-6"
          >
            ไปดูคอร์สเรียนทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2 mb-10">
          {filtered.map(course => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full h-full"
            >
              {/* Image Section */}
              <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden border-b border-gray-100">
                <img 
                   src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} 
                   alt={course.title} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {/* Play overlay for hover */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                   <div className="w-14 h-14 bg-white/95 rounded-full shadow-lg flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
                     <PlayCircle size={28} className="text-primary" />
                   </div>
                </div>
                <div className="absolute top-2 right-2 z-20">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    เรียนจบแล้ว
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">{course.category?.name || 'Uncategorized'}</span>
                </div>
                <h3 className="text-[1.05rem] font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[44px]">{course.title}</h3>
                
                {/* Meta details */}
                <div className="flex items-center gap-3 mt-auto mb-4">
                   <div className="flex items-center gap-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-800">{course.rating || '4.8'}</span>
                      <span className="text-xs text-gray-400 font-medium">({course.reviewCount || '124'})</span>
                   </div>
                   <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 ml-auto">
                      <Clock size={12} /> {new Date(course.completedAt || Date.now()).toLocaleDateString('th-TH')}
                   </div>
                </div>

                {/* Footer Points Info */}
                <div className="pt-3.5 border-t border-gray-100 flex justify-between items-center mt-auto gap-4">
                   <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">คะแนนที่ได้รับ</span>
                      <span className="text-sm font-black text-amber-600">
                        {course.points.toLocaleString()} Pts
                      </span>
                   </div>
                   <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0"></div>
                      <span className="text-[11px] font-medium text-gray-500 truncate">ผู้สอน: {course.instructorName || 'ทีมงานวิทยากร'}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Search no results */}
      {!loading && courses.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
           <p>ไม่พบคอร์สที่ค้นหาในรายการที่เรียนจบแล้ว</p>
        </div>
      )}
    </div>
  );
};

export default CompletedCourses;
