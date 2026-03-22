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
        <div className="flex flex-col items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-2 mb-6">
          {filtered.map(course => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              className="card flex md:flex-col overflow-hidden cursor-pointer hover:border-success/50 transition-all border border-gray-100 group bg-white h-full"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-full md:h-48 overflow-hidden shrink-0">
                 <img src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-success/20 group-hover:bg-success/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle className="text-white" size={32} strokeWidth={3} />
                 </div>
                 <div className="absolute top-2 right-2 badge bg-success text-white shadow-lg shadow-success/20 border-none px-2 py-1 text-[10px]">
                    COMPLETED
                 </div>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider w-full truncate pr-2">{course.category?.name || 'Uncategorized'}</p>
                  </div>
                  <h4 className="font-bold text-base text-gray-900 leading-tight mb-2 group-hover:text-success transition-colors">{course.title}</h4>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">คะแนนที่ได้รับ</span>
                    <span className="text-sm font-black text-warning flex items-center gap-1">
                      <Star size={14} className="fill-warning text-warning" /> {course.points} Pts
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-success bg-success/5 px-2 py-1 rounded border border-success/10 flex items-center gap-1">
                     <Clock size={10} /> {new Date(course.completedAt || Date.now()).toLocaleDateString('th-TH')}
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
