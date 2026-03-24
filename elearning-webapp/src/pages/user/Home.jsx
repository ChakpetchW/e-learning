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
      className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer w-[280px] md:w-full snap-center md:snap-none shrink-0"
    >
      <div className="relative w-full aspect-[16/10] bg-slate-50 overflow-hidden">
        <img 
           src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} 
           alt={course.title} 
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-10">
           <div className="w-16 h-16 bg-white/95 rounded-full shadow-2xl flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-500">
             <PlayCircle size={32} className="text-primary" />
           </div>
        </div>
        {course.isEnrolled && (
          <div className="absolute top-4 right-4 z-20">
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${course.enrollmentStatus === 'COMPLETED' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-primary/90 text-white border-primary-light'}`}>
              {course.enrollmentStatus === 'COMPLETED' ? 'Completed' : 'Enrolled'}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-7 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-4">
           <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{course.category?.name || 'Knowledge'}</span>
           <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
              <Clock size={12} strokeWidth={2.5} />
              <span>{course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || '2'} ชม.</span>
           </div>
        </div>
        
        <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 min-h-[52px] mb-6 group-hover:text-primary transition-colors tracking-tight">{course.title}</h3>
        
        <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
           <div className="flex flex-col">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Price / Reward</p>
              <span className="text-lg font-black text-slate-900 tracking-tighter">
                {course.points > 0 ? `${course.points.toLocaleString()} Pts` : 'Free Access'}
              </span>
           </div>
           <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:border-primary">
              <ChevronRight size={18} strokeWidth={3} />
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-fade-in pt-2 md:pt-4 pb-12">
      
      {/* Premium Hero Section */}
      <section className="relative w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden mesh-bg-premium p-6 md:p-12 lg:p-16 mb-2 border border-white/60 shadow-2xl shadow-slate-200/50 group">
        <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
          <div className="absolute top-[-10%] right-[-10%] w-[150%] h-[150%] bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-4 md:mb-6 animate-slide-up">
              <span className="px-3 md:px-4 py-1.5 bg-primary/10 text-primary text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/10 backdrop-blur-sm">
                WELCOME BACK
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] md:leading-[0.9] mb-4 md:mb-6">
              สวัสดีคุณ<br/>
              <span className="text-gradient-primary">
                {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'}
              </span> <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 font-medium max-w-lg leading-relaxed mb-8 md:mb-10">
              วันนี้เรามาอัปสกิลใหม่ๆ ไปด้วยกันนะครับ
            </p>
            
            {/* Horizontal Stats for Hero */}
            <div className="flex flex-wrap gap-6 md:gap-12 pt-6 border-t border-slate-200/60">
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">คอร์สที่เรียนอยู่</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length}</p>
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">เรียนจบแล้ว</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{courses.filter(c => c.enrollmentStatus === 'COMPLETED').length}</p>
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">คะแนนสะสม</p>
                  <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">{(courses.reduce((acc, c) => acc + (c.points || 0), 0)).toLocaleString()}</p>
               </div>
            </div>
          </div>

          {/* Continue Learning Float Card */}
          <div className="lg:col-span-2 relative">
            {continueCourse ? (
              <div 
                onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
                className="group/cont glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 cursor-pointer transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.25)] border-white/80 ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                    <PlayCircle size={20} className="md:w-6 md:h-6" />
                  </div>
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] md:text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/10">In Progress</span>
                </div>
                
                <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight mb-5 md:mb-6 line-clamp-2 group-hover/cont:text-primary transition-colors">
                  {continueCourse.title}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                    <p className="text-xs md:text-sm font-black text-primary italic">{continueCourse.progressPercent}%</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 overflow-hidden ring-1 ring-black/5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${continueCourse.progressPercent}%` }}
                    />
                  </div>
                </div>
                
                <button className="w-full mt-6 md:mt-8 py-3.5 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover/cont:bg-primary transition-all">
                  Resume Lesson <ChevronRight size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            ) : (
              <div className="card h-full min-h-[250px] md:min-h-[300px] glass-card border-none flex flex-col items-center justify-center text-center p-8 md:p-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Target size={24} className="text-slate-300 md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 font-black">เริ่มบทเรียนใหม่</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">ค้นหาคอร์สที่น่าสนใจและเริ่มเส้นทางการเรียนรู้ของคุณเลย!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Goal Bento */}
        <div className="card bg-white p-7 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-between h-full shadow-[0_20px_40px_rgba(0,0,0,0.02)] ring-1 ring-slate-100 border-none group hover:ring-primary/20 transition-all duration-500">
          <div>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110 duration-500 ${completedThisWeekCount >= 1 ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white shadow-slate-200'}`}>
              <Target size={24} strokeWidth={2.5} className="md:w-6.5 md:h-6.5"/>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold mb-1.5 uppercase tracking-widest">WEEKLY TARGET</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">Complete 1 Course</h3>
          </div>
          <div className="mt-6 md:mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
             <div className="flex -space-x-1.5 md:-space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-slate-100 text-[8px] flex items-center justify-center font-bold text-slate-400">{i}</div>)}
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className={`text-lg font-black px-3 md:px-4 py-1.5 rounded-xl ${completedThisWeekCount >= 1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-900 bg-slate-50'}`}>
                  {completedThisWeekCount}/1
                </span>
             </div>
          </div>
        </div>

        {/* Categories Quick Filter Bar (Scrollable on mobile) */}
        <div className="md:col-span-2 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Browse Categories</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{categories.length} Topics</p>
           </div>
           <div className="flex flex-wrap gap-2 md:gap-3">
              <button 
                onClick={() => navigate('/user/courses')}
                className="px-5 md:px-6 py-3.5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                All Courses
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => navigate(`/user/courses?category=${encodeURIComponent(cat.name)}`)}
                  className="px-5 md:px-6 py-3.5 bg-white text-slate-600 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm"
                >
                  {cat.name}
                </button>
              ))}
           </div>
           <div 
             onClick={() => navigate('/user/rewards')}
             className="mt-2 md:mt-4 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-between overflow-hidden relative group cursor-pointer"
           >
              <div className="relative z-10">
                 <h4 className="text-lg md:text-xl font-black mb-1">Explore New Rewards</h4>
                 <p className="text-slate-400 text-[11px] md:text-xs font-medium">Use your points to unlock exclusive rewards.</p>
              </div>
              <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
           </div>
        </div>
      </div>

      {/* Categorized Courses */}
      {categorizedCourses.map(category => (
        <section key={category.id} className="mt-4">
          <div className="flex justify-between items-end mb-6 pl-2">
            <h3 className="text-2xl md:text-[1.75rem] font-black text-slate-900 tracking-tight">{category.name}</h3>
            <button 
              onClick={() => navigate(`/user/courses?category=${encodeURIComponent(category.name)}`)} 
              className="text-primary text-[11px] md:text-sm font-bold flex items-center gap-1 hover:text-primary-hover px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-full active:scale-95 transition-all"
            >
              ดูทั้งหมด <ChevronRight size={14} strokeWidth={3} className="md:w-4 md:h-4" />
            </button>
          </div>
          
          <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
            {category.courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      ))}
          
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
