import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        const [courseRes, catRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories()
        ]);
        setCourses(courseRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const continueCourse = courses.find(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS');
  
  // Group courses by category
  const categorizedCourses = categories.map(cat => ({
    ...cat,
    courses: courses.filter(c => c.categoryId === cat.id)
  })).filter(cat => cat.courses.length > 0);

  // Fallback for courses without category or if list is empty
  const uncategorized = courses.filter(c => !c.categoryId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const CourseCard = ({ course }) => (
    <div 
      onClick={() => navigate(`/user/courses/${course.id}`)}
      className="card min-w-[260px] md:min-w-0 md:w-full snap-center md:snap-none flex-shrink-0 md:flex-shrink cursor-pointer group flex flex-col justify-between"
    >
      <div className="relative h-40 md:h-48 overflow-hidden">
        <img src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 points-pill shadow-sm bg-white/90 backdrop-blur-sm !text-warning border border-orange-100">
          <span className="opacity-60 text-[10px]">⭐</span>{course.points} Pts
        </div>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle size={48} className="text-white drop-shadow-lg" strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="p-4 bg-white flex-1 flex flex-col justify-center">
        <h4 className="font-bold text-base leading-tight mb-2 text-gray-900">{course.title}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Clock size={12}/> 2h</span>
          <span className="text-gray-400">{course.category?.name || 'Uncategorized'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 animate-fade-in pt-10">
      
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          สวัสดีคุณ {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'} <span className="text-2xl">👋</span>
        </h2>
        <p className="text-sm text-gray-500 font-medium">พร้อมที่จะเรียนรู้สิ่งใหม่ๆ หรือยัง?</p>
        
        <div className="mt-5 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100/80">
          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-inner">
            <Target size={24} strokeWidth={2.5}/>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-wider">เป้าหมายสัปดาห์นี้</p>
            <p className="text-base font-extrabold text-gray-800">เรียนจบ 1 คอร์ส (0/1)</p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <section>
        <h3 className="text-lg font-bold mb-3 text-gray-900">เรียนต่อจากที่ค้างไว้</h3>
        
        {continueCourse ? (
          <div 
            className="card border border-primary/20 bg-white relative overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
          >
            {/* Subtle gradient strip */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 p-1">
              <div className="w-full sm:w-1/3 md:w-1/4 aspect-video sm:aspect-square md:aspect-video relative rounded-t-lg sm:rounded-lg overflow-hidden shrink-0">
                <img src={continueCourse.image ? getFullUrl(continueCourse.image) : DEFAULT_COURSE_IMAGE} alt="Course" className="w-full h-full object-cover group-hover:scale-105 transition-duration-500" />
                <div className="absolute top-2 right-2 badge bg-white/90 text-primary shadow-sm backdrop-blur-sm">
                  Continue
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between p-3 sm:p-2 sm:py-3">
                <div>
                  <span className="text-xs font-bold text-primary mb-1 block">{continueCourse.category?.name || 'Uncategorized'}</span>
                  <h4 className="font-bold text-base leading-tight mb-2">{continueCourse.title}</h4>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                    <span>ความคืบหน้า</span>
                    <span className="text-primary">{continueCourse.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full relative" style={{ width: `${continueCourse.progressPercent}%` }}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50/50 border border-gray-200 border-dashed rounded-2xl p-8 text-center text-gray-400 font-medium">
            คุณยังไม่มีคอร์สที่กำลังเรียนอยู่
          </div>
        )}
      </section>

      {/* Categorized Courses */}
      {categorizedCourses.map(category => (
        <section key={category.id}>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{category.name}</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-0.5 hover:text-primary-hover px-2 py-1 bg-primary/5 rounded-lg active:scale-95 transition-transform">
              ดูทั้งหมด <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-2 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
            {category.courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      ))}

      {/* Uncategorized Fallback */}
      {uncategorized.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-900">คอร์สแนะนำสำหรับคุณ</h3>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-2 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
            {uncategorized.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      )}

      {courses.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center text-gray-400">
            ยังไม่มีคอร์สเรียนในระบบ
        </div>
      )}

      {/* spacer for bottom padding */}
      <div className="h-4"></div>
    </div>
  );
};

export default Home;
