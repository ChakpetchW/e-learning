import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, PlayCircle, BookOpen, Check, Share2, Bookmark, Star, MonitorPlay, Infinity as InfinityIcon, FileText, ChevronDown } from 'lucide-react';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  // UI State
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await userAPI.getCourseDetails(id);
        setCourse(response.data);
      } catch (error) {
        console.error('Fetch course detail error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await userAPI.enrollCourse(id);
      const response = await userAPI.getCourseDetails(id);
      setCourse(response.data);
    } catch (error) {
       console.error('Enroll error:', error);
       alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const durationHours = course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || 2;

  // Parse JSON helper
  const tryParse = (str, fallback) => {
    try {
      if (!str) return fallback;
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const learningPoints = tryParse(course?.whatYouWillLearn, [
    "ทักษะที่สามารถนำไปประยุกต์ใช้ในการทำงานได้จริงทันที",
    "ทำความเข้าใจพื้นฐานที่แน่นหนา และต่อยอดไปสู่ระดับสูง",
    "เทคนิคและเคล็ดลับจากประสบการณ์จริงของผู้เชี่ยวชาญ",
    "วิธีคิดและแก้ปัญหาเมื่อเจอสถานการณ์จริง"
  ]);

  const whatYouGet = tryParse(course?.whatYouWillGet, [
    { icon: <MonitorPlay size={18} className="text-primary"/>, text: `วิดีโอระดับ Full HD ความยาว {durationHours} ชั่วโมง` },
    { icon: <FileText size={18} className="text-primary"/>, text: "เอกสารประกอบการเรียนแจกฟรี" },
    { icon: <InfinityIcon size={18} className="text-primary"/>, text: "เข้าถึงเนื้อหาได้ตลอดชีพ ไม่มีวันหมดอายุ" },
    { icon: <Award size={18} className="text-primary"/>, text: "ใบรับรองการจบหลักสูตร (Certificate)" }
  ]);

  return (
    <div className="flex flex-col min-h-full pb-20 md:pb-32 bg-slate-50 relative -mt-4 -mx-4 md:mt-0 md:mx-0">
      
      {/* 1. HERO BANNER (Full Width, Deep Charcoal) */}
      <div className="bg-slate-900 text-white pt-10 pb-16 md:pt-16 md:pb-32 px-5 md:px-8 xl:px-0">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row relative">
            
            {/* Left Content (Text) */}
            <div className="w-full lg:w-[60%] lg:pr-12 z-10">
               {/* Breadcrumb & Navigation */}
               <div className="flex items-center gap-4 text-sm font-bold text-slate-400 mb-6">
                  <button onClick={() => navigate(-1)} className="hover:text-white transition-colors flex items-center gap-1">
                     <ArrowLeft size={16} /> กลับ
                  </button>
                  <span>/</span>
                  <span className="text-primary-light uppercase tracking-wider">{course.category?.name || 'หมวดหมู่ทั่วไป'}</span>
               </div>

               <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-black text-white leading-tight mb-4 drop-shadow-sm">
                  {course.title}
               </h1>
               
               <p className="text-lg text-slate-300 font-medium mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed">
                  {course.description || "เรียนรู้ทักษะที่จำเป็นและนำไปใช้ได้จริงในสายงานของคุณ พร้อมเทคนิคจากผู้เชี่ยวชาญระดับประเทศ"}
               </p>

               {/* Meta Stats Row */}
               <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-bold">
                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-md">
                     <Star size={16} className="fill-amber-400" />
                     <span className="text-white text-base">{course.rating || 4.8}</span>
                     <span className="text-slate-400 ml-1 font-medium">({(course.reviewCount || 1240).toLocaleString()} รีวิว)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                     <MonitorPlay size={18} className="text-slate-400" />
                     <span>ผู้เรียน {(course.studentCount || 5000).toLocaleString()}+ คน</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                     <Clock size={18} className="text-slate-400" />
                     <span>ความยาว {course.totalDuration || `${durationHours} ชั่วโมง`}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN CONTENT GRID (Split Layout) */}
      <div className="max-w-6xl mx-auto w-full px-5 md:px-8 xl:px-0 flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 relative -mt-6 md:-mt-20 z-20">
         
         {/* LEFT COLUMN: Course Details */}
         <div className="w-full lg:w-[60%] lg:flex-1 flex flex-col gap-10 pb-10 mt-6 lg:mt-0">
            
            {/* Mobile-only Price Card (Hidden on Desktop) */}
            <div className="lg:hidden bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-4 flex justify-between items-center group">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ราคาคอร์ส</p>
                  <div className="text-2xl font-black text-primary">{course.points > 0 ? `${course.points} พ้อยท์` : 'เรียนฟรี'}</div>
               </div>
               {course.isEnrolled ? (
                  <button onClick={() => navigate(`/user/courses/${course.id}/lesson/${course.lessons[0]?.id}`)} className="bg-primary/10 text-primary px-6 py-3 rounded-lg font-bold">
                     เข้าเรียน
                  </button>
               ) : (
                  <button onClick={handleEnroll} disabled={enrolling} className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-md shadow-primary/20">
                     ลงทะเบียน
                  </button>
               )}
            </div>

            {/* What you'll learn */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
               <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">สิ่งที่คุณจะได้เรียนรู้ในคอร์สนี้</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {learningPoints.map((text, idx) => (
                     <div key={idx} className="flex items-start gap-3">
                        <Check size={20} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                        <span className="text-[15px] font-medium text-slate-600 leading-relaxed">{text}</span>
                     </div>
                  ))}
               </div>
            </section>

            {/* Course Description */}
            <section>
               <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 px-2">เนื้อหาหลักสูตร (Description)</h2>
               <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-loose font-medium text-[15px]">
                  {course.description || "คอร์สนี้ถูกออกแบบมาเพื่อให้ผู้เรียนสามารถเข้าใจเนื้อหาได้อย่างรวดเร็วและเป็นระบบ ไม่ว่าคุณจะมีพื้นฐานมาก่อนหรือไม่ก็ตาม เราจะพากันไปตั้งแต่ก้าวแรกจนถึงการสร้างผลงานชิ้นโบว์แดงด้วยตัวคุณเอง"}
               </div>
            </section>

            {/* Syllabus / Lessons */}
            <section>
               <div className="flex justify-between items-end mb-4 px-2">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900">สารบัญคอร์สเรียน</h2>
                  <div className="text-sm font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">{course.lessons?.length || 0} บทเรียน</div>
               </div>
               
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col divide-y divide-slate-100">
                  {course.lessons?.map((lesson, idx) => (
                     <div 
                        key={lesson.id} 
                        onClick={() => course.isEnrolled && navigate(`/user/courses/${course.id}/lesson/${lesson.id}`)}
                        className={`p-5 flex items-center gap-4 transition-colors
                                  ${course.isEnrolled ? 'cursor-pointer hover:bg-slate-50 group' : 'opacity-90'}
                        `}
                     >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                       ${lesson.isCompleted ? 'bg-emerald-100 text-emerald-600' : 
                                         course.isEnrolled ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors' : 
                                         'bg-slate-100 text-slate-400'}`}>
                           {lesson.isCompleted ? <Check size={16} strokeWidth={3}/> : <PlayCircle size={16} strokeWidth={2.5}/>}
                        </div>
                        
                        <div className="flex-1">
                           <h4 className={`text-[15px] font-bold ${lesson.isCompleted ? 'text-slate-500' : 'text-slate-800'}`}>
                              {idx + 1}. {lesson.title}
                           </h4>
                           <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-400">
                              <span className="flex items-center gap-1"><MonitorPlay size={12}/> วิดีโอ</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock size={12}/> {lesson.duration || '10'} นาที</span>
                           </div>
                        </div>

                        {!course.isEnrolled && (
                           <div className="shrink-0 text-slate-300">
                              <Bookmark size={18} />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </section>

            {/* Instructor */}
            <section className="mb-10">
               <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 px-2">ผู้สอน (Instructor)</h2>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                  <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0 border-4 border-white shadow-md overflow-hidden">
                     {course.instructorAvatar ? (
                        <img src={getFullUrl(course.instructorAvatar)} alt="Instructor" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl uppercase">
                           {course.instructorName?.charAt(0) || 'I'}
                        </div>
                     )}
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-900 mb-1">{course.instructorName || 'ทีมงานวิทยากรผู้เชี่ยวชาญ'}</h3>
                     <p className="text-[13px] font-bold text-primary mb-3">{course.instructorRole || 'Enterprise Instructor'}</p>
                     <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        {course.instructorBio || "ทีมงานผู้มีความเชี่ยวชาญเฉพาะด้านที่ผ่านประสบการณ์การทำงานในองค์กรชั้นนำ พร้อมถ่ายทอดทักษะระดับมืออาชีพให้คุณ"}
                     </p>
                  </div>
               </div>
            </section>
         </div>

         {/* RIGHT COLUMN: Sticky Sidebar Card */}
         <div className="w-full lg:w-[40%] xl:w-[35%] shrink-0 lg:max-w-[380px]">
            <div className={`bg-white rounded-[1.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden sticky top-24 transition-transform duration-500 ${isScrolled ? 'lg:-translate-y-4' : ''}`}>
               
               {/* Video Thumbnail Area */}
               <div className="relative aspect-video bg-slate-900 group cursor-pointer overflow-hidden pb-1">
                  {showVideo && course.previewVideoUrl ? (
                     <iframe 
                       className="w-full h-full"
                       src={course.previewVideoUrl.includes('youtube.com') || course.previewVideoUrl.includes('youtu.be') 
                         ? `https://www.youtube.com/embed/${course.previewVideoUrl.split('v=')[1]?.split('&')[0] || course.previewVideoUrl.split('/').pop()}?autoplay=1` 
                         : course.previewVideoUrl}
                       title="Course Preview"
                       frameBorder="0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                     ></iframe>
                  ) : (
                     <>
                       <img src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                       <div className="absolute inset-0 flex flex-col items-center justify-center" onClick={() => course.previewVideoUrl && setShowVideo(true)}>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center mb-2 group-hover:bg-primary transition-colors duration-300 shadow-xl">
                             <PlayCircle size={32} className="text-white ml-1" strokeWidth={2}/>
                          </div>
                          <span className="text-white text-xs font-bold tracking-widest uppercase drop-shadow-md">ดูตัวอย่างคอร์สฟรี</span>
                       </div>
                     </>
                  )}
               </div>

               {/* Pricing & Actions */}
               <div className="p-6 md:p-8">
                  <div className="flex items-end gap-2 mb-6">
                     <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        {course.points > 0 ? course.points : 'ฟรี'}
                     </span>
                     <span className="text-lg font-bold text-slate-400 mb-1">{course.points > 0 ? 'พ้อยท์' : 'บาท'}</span>
                  </div>

                  {course.isEnrolled ? (
                     <div className="flex flex-col gap-3">
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                           <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{width: `${course.progressPercent || 0}%`}}></div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 text-center mb-2">เรียนไปแล้ว {course.progressPercent || 0}%</p>
                        
                        <button 
                           onClick={() => navigate(`/user/courses/${course.id}/lesson/${course.lessons[0]?.id}`)}
                           className="w-full py-4 bg-primary text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-[15px]"
                        >
                           {course.progressPercent === 0 ? 'เริ่มเรียนเลย' : 'เรียนต่อให้จบ'} <ArrowLeft size={18} className="rotate-180" />
                        </button>
                     </div>
                  ) : (
                     <button 
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors flex items-center justify-center text-[15px]"
                     >
                        {enrolling ? (
                           <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : 'ลงทะเบียนเรียนทันที'}
                     </button>
                  )}

                  <p className="text-xs font-bold text-center text-slate-400 mt-4">รับประกันความพึงพอใจ</p>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
                     <h4 className="text-sm font-black text-slate-900 mb-1">สิ่งที่คุณจะได้รับ</h4>
                     {(() => {
                        const IconMap = {
                           MonitorPlay: MonitorPlay,
                           FileText: FileText,
                           InfinityIcon: InfinityIcon,
                           Award: Award,
                           PlayCircle: PlayCircle,
                           BookOpen: BookOpen
                        };

                        return whatYouGet.map((item, idx) => {
                           // Support both string (old) and object (new)
                           const isObj = typeof item === 'object' && item !== null && !item.$$typeof;
                           const iconName = isObj ? item.icon : null;
                           const text = (isObj ? item.text : item).replace('{durationHours}', durationHours);
                           const IconComponent = IconMap[iconName] || MonitorPlay;

                           return (
                              <div key={idx} className="flex items-center gap-3 text-slate-600 text-[13.5px] font-medium">
                                 {isObj ? <IconComponent size={18} className="text-primary"/> : (item.icon || <MonitorPlay size={18} className="text-primary"/>)}
                                 {text}
                              </div>
                           );
                        });
                     })()}
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default CourseDetail;
