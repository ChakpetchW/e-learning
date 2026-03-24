import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import CourseCard from '../../components/common/CourseCard';

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
    <div className="flex flex-col gap-6 animate-fade-in h-full pt-2 pb-32 relative">
      <div className="sticky top-[-1px] z-40 bg-[#f8fafc]/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 space-y-4 shadow-sm sm:shadow-none border-b border-gray-100 sm:border-none mb-2">
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
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              variant="completed"
            />
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
