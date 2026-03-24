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
      className="card w-[300px] md:w-full snap-center md:snap-none flex-shrink-0 md:flex-shrink cursor-pointer group flex flex-col items-stretch overflow-hidden h-auto shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] ring-1 ring-slate-100/80 border-none bg-white"
    >
      <div className="relative w-full h-[190px] xl:h-[220px] shrink-0 p-3 pb-0">
        <div className="w-full h-full rounded-[1.25rem] overflow-hidden relative shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-slate-100">
          <img 
            src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
          />
          <div className="absolute top-3 left-3 points-pill shadow-md glass !text-amber-700 border border-white/60">
            <span className="opacity-80 text-[10px] mr-1">⭐</span>{course.points} Pts
          </div>
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors duration-500 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full glass-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
              <PlayCircle size={28} className="text-white ml-1" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-start">
        <h4 className="font-extrabold text-[#0F172A] text-[1.05rem] leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h4>
        <div className="flex items-center gap-3 text-xs font-semibold mt-auto pt-4 border-t border-slate-50">
          <span className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-lg text-slate-600 ring-1 ring-slate-200/60">
            <Clock size={14} className="text-slate-400"/> 2h
          </span>
          <span className="text-slate-400 truncate">{course.category?.name || 'Uncategorized'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-12 animate-fade-in pt-6 md:pt-2">
      
      {/* Header Section */}
      <div className="mb-2">
        <h2 className="text-title text-slate-800 mb-2 flex items-center gap-3">
          สวัสดีคุณ {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'} <span className="text-4xl hover:animate-bounce cursor-default">👋</span>
        </h2>
        <p className="text-[1.1rem] text-slate-500 font-medium">ยินดีต้อนรับกลับสู่แพลตฟอร์มการเรียนรู้ของคุณ</p>
      </div>

      {/* Bento Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Continue Learning Hero (takes 2 cols on lg) */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {continueCourse ? (
             <div 
               className="card mesh-bg relative overflow-hidden group cursor-pointer h-[320px] md:h-full min-h-[300px] flex flex-col md:flex-row shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-none ring-1 ring-slate-200/50"
               onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
             >
               <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative z-10 w-full md:w-3/5">
                 <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-primary font-bold text-xs mb-5 w-max border border-white/60 shadow-sm uppercase tracking-wider">เรียนต่อจากคราวที่แล้ว</span>
                 <h3 className="text-2xl md:text-[2rem] font-extrabold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-3">{continueCourse.title}</h3>
                 
                 <div className="mt-auto md:mt-8 w-full max-w-sm">
                   <div className="flex justify-between text-xs font-bold text-slate-600 mb-2.5">
                     <span>ความคืบหน้า</span>
                     <span className="text-primary">{continueCourse.progressPercent}%</span>
                   </div>
                   <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-3 overflow-hidden shadow-inner ring-1 ring-black/5">
                     <div className="bg-primary h-full rounded-full relative" style={{ width: `${continueCourse.progressPercent}%` }}>
                       <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent"></div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="absolute inset-0 md:relative md:w-2/5 aspect-video md:aspect-auto shrink-0 opacity-20 md:opacity-100">
                  <img src={continueCourse.image ? getFullUrl(continueCourse.image) : DEFAULT_COURSE_IMAGE} alt="Course" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#F1F5F9] md:via-[#F1F5F9]/50 to-transparent mix-blend-normal"></div>
               </div>
             </div>
          ) : (
            <div className="card h-full min-h-[300px] bg-slate-50 border-none ring-1 ring-slate-200/50 flex flex-col items-center justify-center text-center p-8 border-dashed">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                 <PlayCircle size={32} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีคอร์สที่กำลังเรียนขณนี้</h3>
               <p className="text-slate-500 font-medium">เริ่มต้นค้นหาและลงทะเบียนคอร์สใหม่เพื่อดูความคืบหน้าที่นี่</p>
            </div>
          )}
        </div>
        
        {/* Weekly Goal Bento (takes 1 col) */}
        <div className="card bg-white p-8 flex flex-col justify-between h-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100 border-none">
          <div>
            <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-indigo-100/50">
              <Target size={28} strokeWidth={2.5}/>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold mb-2 uppercase tracking-widest">เป้าหมายประจำสัปดาห์</p>
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">เรียนจบ 1 คอร์ส</h3>
            <p className="text-slate-500 font-medium text-[15px] leading-relaxed">พัฒนาและอัปสกิลของคุณอย่างต่อเนื่องเพื่อการเติบโตที่ไม่สิ้นสุด</p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100/80">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">ความสำเร็จ</span>
                <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">0/1</span>
             </div>
          </div>
        </div>
        
      </div>

      {/* Categorized Courses */}
      {categorizedCourses.map(category => (
        <section key={category.id}>
          <div className="flex justify-between items-end mb-6 pl-2">
            <h3 className="text-[1.75rem] font-black text-slate-900 tracking-tight">{category.name}</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-hover px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-full active:scale-95 transition-all">
              ดูทั้งหมด <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
          
          <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
            {category.courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      ))}

      {/* Uncategorized Fallback */}
      {uncategorized.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6 pl-2">
            <h3 className="text-[1.75rem] font-black text-slate-900 tracking-tight">คอร์สแนะนำสำหรับคุณ</h3>
          </div>
          <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
            {uncategorized.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      )}

      {courses.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm ring-1 ring-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <PlayCircle size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">ยังไม่มีคอร์สเรียนในระบบ</h3>
            <p className="text-slate-400 font-medium">รอการอัปเดตคอร์สดีๆ เร็วๆ นี้</p>
        </div>
      )}

      {/* spacer for bottom padding */}
      <div className="h-8"></div>
    </div>
  );
};

export default Home;
