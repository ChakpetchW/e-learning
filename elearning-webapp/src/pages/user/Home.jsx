import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, ChevronRight, Target, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';
import CategorySearchModal from '../../components/common/CategorySearchModal';
import { Grid } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(1);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        const [courseRes, catRes, pointsRes, settingsRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories(),
          userAPI.getPoints(),
          userAPI.getSettings()
        ]);
        setCourses(courseRes.data);
        setCategories(catRes.data);
        setPoints(pointsRes.data.balance || 0);
        setWeeklyGoal(parseInt(settingsRes.data.weekly_goal) || 1);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setPointsLoading(false);
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
      className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-[280px] md:w-full snap-center md:snap-none shrink-0 h-full"
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden border-b border-gray-100">
        <img 
           src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} 
           alt={course.title} 
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-14 h-14 bg-white/95 rounded-full shadow-lg flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
             <PlayCircle size={28} className="text-primary" />
           </div>
        </div>
        {course.isEnrolled && (
          <div className="absolute top-2 right-2 z-20">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${course.enrollmentStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
              {course.enrollmentStatus === 'COMPLETED' ? 'เรียนจบแล้ว' : 'กำลังเรียน'}
            </span>
          </div>
        )}
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
           <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-medium border-l border-gray-200 pl-3">
              <Clock size={14} className="text-gray-400" />
              <span>{course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || course.totalDuration || '2 ชม.'}</span>
           </div>
        </div>

        {/* Footer Price / Points */}
        <div className="pt-3.5 border-t border-gray-100 flex justify-between items-center mt-auto gap-4">
           <div className="flex items-center gap-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0"></div>
              <span className="text-[11px] font-medium text-gray-500 truncate">ผู้สอน: {course.instructorName || 'ทีมงานวิทยากร'}</span>
           </div>
           <div className="flex flex-col items-end leading-tight shrink-0">
              <span className="text-[1.1rem] font-black text-primary tracking-tighter">
                 {course.points > 0 ? course.points.toLocaleString() : 'ฟรี'}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest -mt-0.5">
                 {course.points > 0 ? 'Pts.' : 'เรียน'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-fade-in pt-0 md:pt-4 pb-12">
      
      {/* Premium Hero Section - Full width on mobile */}
      <section className="relative w-[calc(100%+2.5rem)] -mx-5 md:mx-0 md:w-full rounded-none md:rounded-[3rem] md:rounded-t-[3rem] overflow-hidden mesh-bg-premium p-6 md:p-12 lg:p-16 mb-2 border-b md:border border-white/60 shadow-2xl shadow-slate-200/50 group">
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
                  <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">
                    {pointsLoading ? '...' : points.toLocaleString()}
                  </p>
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
              <div className="card h-full min-h-[180px] md:min-h-[300px] glass-card border-none flex flex-row md:flex-col items-center justify-center text-center p-6 md:p-10 bg-white/40 ring-1 ring-white/50">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/60 rounded-full flex items-center justify-center mr-4 md:mr-0 md:mb-6 shadow-sm">
                  <Target size={22} className="text-slate-400 md:w-7 md:h-7" />
                </div>
                <div className="text-left md:text-center">
                  <h3 className="text-base md:text-lg font-black text-slate-800 mb-1">เริ่มบทเรียนใหม่</h3>
                  <p className="text-slate-500 text-[11px] md:text-sm font-medium leading-relaxed">ค้นหาคอร์สที่น่าสนใจและเริ่มพัฒนาทักษะได้เลย!</p>
                </div>
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
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110 duration-500 ${completedThisWeekCount >= weeklyGoal ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white shadow-slate-200'}`}>
              <Target size={24} strokeWidth={2.5} className="md:w-6.5 md:h-6.5"/>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold mb-1.5 uppercase tracking-widest">WEEKLY TARGET</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">Complete {weeklyGoal} {weeklyGoal > 1 ? 'Courses' : 'Course'}</h3>
          </div>
          <div className="mt-6 md:mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
             <div className="flex -space-x-1.5 md:-space-x-2">
                {[...Array(Math.min(3, weeklyGoal))].map((_, i) => (
                  <div key={i} className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-slate-100 text-[8px] flex items-center justify-center font-bold text-slate-400">{i+1}</div>
                ))}
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className={`text-lg font-black px-3 md:px-4 py-1.5 rounded-xl ${completedThisWeekCount >= weeklyGoal ? 'text-emerald-600 bg-emerald-50' : 'text-slate-900 bg-slate-50'}`}>
                  {completedThisWeekCount}/{weeklyGoal}
                </span>
             </div>
          </div>
        </div>

        {/* Categories Quick Filter Bar (Scrollable on mobile) */}
        <div className="md:col-span-2 flex flex-col gap-5">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Browse Categories</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{categories.length} Topics</p>
           </div>

            <div className="flex gap-3 flex-wrap items-center text-xs px-1">
               <button
                 onClick={() => navigate('/user/courses')}
                 className="shrink-0 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all whitespace-nowrap min-w-fit"
               >
                 All Courses
               </button>
               {categories.slice(0, 4).map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => navigate(`/user/courses?category=${encodeURIComponent(cat.name)}`)}
                   className="shrink-0 px-6 md:px-8 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm whitespace-nowrap min-w-[100px] md:min-w-[140px]"
                 >
                   {cat.name}
                 </button>
               ))}
               
               {categories.length > 4 && (
                 <button 
                  onClick={() => setIsCatModalOpen(true)}
                  className="shrink-0 px-6 md:px-8 py-3.5 bg-primary/5 text-primary border border-primary/20 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all shadow-sm whitespace-nowrap flex items-center gap-2"
                 >
                   <Grid size={14} /> ดูทั้งหมด
                 </button>
               )}

           </div>

           <div
             onClick={() => navigate('/user/rewards')}
             className="mt-1 md:mt-2 p-7 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-between overflow-hidden relative group cursor-pointer shadow-lg shadow-slate-200"
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
      <div className="space-y-12 md:space-y-20 mt-12 md:mt-16">
        {categorizedCourses.map(category => (
          <section key={category.id}>
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
      </div>

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

      {/* Categories Search Modal */}
      <CategorySearchModal 
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        courses={courses}
        onSelect={(catName) => navigate(`/user/courses?category=${encodeURIComponent(catName)}`)}
      />
    </div>
  );
};

export default Home;
