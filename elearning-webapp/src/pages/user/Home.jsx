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

  // Calculate courses completed this week
  const completedThisWeekCount = courses.filter(c => {
    if (c.enrollmentStatus !== 'COMPLETED' || !c.completedAt) return false;
    const completedDate = new Date(c.completedAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return completedDate >= oneWeekAgo;
  }).length;

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
      className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-[280px] md:w-full snap-center md:snap-none shrink-0"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden border-b border-gray-100">
        <img 
           src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} 
           alt={course.title} 
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-14 h-14 bg-white/95 rounded-full shadow-lg flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
             <PlayCircle size={28} className="text-primary ml-1" />
           </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">{course.category?.name || 'Uncategorized'}</span>
           {course.isEnrolled && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${course.enrollmentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                {course.enrollmentStatus === 'COMPLETED' ? 'เรียนจบแล้ว' : 'กำลังเรียน'}
              </span>
            )}
        </div>
        <h3 className="text-[1.05rem] font-bold text-slate-900 leading-snug line-clamp-2 min-h-[44px] mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
        
        <div className="flex items-center gap-3 mt-auto mb-4">
           <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-medium border-gray-200">
              <Clock size={14} className="text-gray-400" />
              <span>{course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || '2'} ชม.</span>
           </div>
        </div>

        <div className="pt-3.5 border-t border-gray-100 flex justify-between items-center mt-auto">
           <span className="text-[1.1rem] font-black text-primary">
              {course.points > 0 ? `${course.points} Pts` : 'ฟรีเรียน'}
           </span>
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
            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-inner ring-1 ${completedThisWeekCount >= 1 ? 'bg-emerald-50 text-emerald-600 ring-emerald-100/50' : 'bg-indigo-50 text-indigo-600 ring-indigo-100/50'}`}>
              <Target size={28} strokeWidth={2.5}/>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold mb-2 uppercase tracking-widest">เป้าหมายประจำสัปดาห์</p>
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">เรียนจบ 1 คอร์ส</h3>
            <p className="text-slate-500 font-medium text-[15px] leading-relaxed">พัฒนาและอัปสกิลของคุณอย่างต่อเนื่องเพื่อการเติบโตที่ไม่สิ้นสุด</p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100/80">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">ความสำเร็จ</span>
                <span className={`text-lg font-black px-3 py-1 rounded-lg ${completedThisWeekCount >= 1 ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 bg-indigo-50'}`}>
                  {completedThisWeekCount}/1
                </span>
             </div>
          </div>
        </div>
        
      </div>

      {/* Categorized Courses */}
      {categorizedCourses.map(category => (
        <section key={category.id}>
          <div className="flex justify-between items-end mb-6 pl-2">
            <h3 className="text-[1.75rem] font-black text-slate-900 tracking-tight">{category.name}</h3>
            <button onClick={() => navigate('/user/courses')} className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-hover px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-full active:scale-95 transition-all">
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
