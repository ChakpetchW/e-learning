import React from 'react';
import { PlayCircle, Star, Clock } from 'lucide-react';
import { getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseCard = ({ course, onClick, className = "", variant = "default" }) => {
  const isCompleted = variant === "completed" || course.enrollmentStatus === 'COMPLETED';

  return (
    <div 
      onClick={onClick}
      className={`group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full ${className}`}
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
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
              {isCompleted ? 'เรียนจบแล้ว' : 'กำลังเรียน'}
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
           {variant === 'completed' ? (
             <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                <Clock size={12} /> {new Date(course.completedAt || Date.now()).toLocaleDateString('th-TH')}
             </div>
           ) : (
             <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-800">{course.rating || '4.8'}</span>
                <span className="text-xs text-gray-400 font-medium">({course.reviewCount || '124'})</span>
             </div>
           )}
           
           {variant !== 'completed' && (
             <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-medium border-l border-gray-200 pl-3">
                <Clock size={14} className="text-gray-400" />
                <span>{course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || course.totalDuration || '2 ชม.'}</span>
             </div>
           )}
        </div>

        {/* Footer Price / Points */}
        <div className="pt-3.5 border-t border-gray-100 flex justify-between items-center mt-auto gap-4">
           <div className={`flex items-center gap-1.5 overflow-hidden ${variant === 'completed' ? 'order-2' : ''}`}>
              <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0"></div>
              <span className="text-[11px] font-medium text-gray-500 truncate">ผู้สอน: {course.instructorName || 'ทีมงานวิทยากร'}</span>
           </div>
           <div className={`flex flex-col items-end leading-tight shrink-0 ${variant === 'completed' ? 'order-1' : ''}`}>
              <span className={`text-[1.1rem] font-black tracking-tighter ${variant === 'completed' ? 'text-amber-600' : 'text-primary'}`}>
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
};

export default CourseCard;
