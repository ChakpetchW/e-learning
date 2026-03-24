import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Clock, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { userAPI } from '../../utils/api';
import VideoPlayer from '../../components/common/VideoPlayer';

const API_BASE = 'http://localhost:5000';

// Helper to get full URL for uploaded files
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
};

const LessonPlayer = () => {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quiz State
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await userAPI.getCourseDetails(courseId);
        setCourse(response.data);

        const currentLesson = response.data.lessons.find(l => l.id === lessonId);
        setLesson(currentLesson);
        setCompleted(currentLesson?.isCompleted || false);

        if (currentLesson?.lastAttempt) {
          setQuizResult({
            scorePercent: currentLesson.lastAttempt.score,
            passed: currentLesson.lastAttempt.status === 'PASSED',
            passScore: currentLesson.passScore || 60
          });
        }
      } catch (error) {
        console.error('Fetch lesson error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [courseId, lessonId]);

  const handleComplete = async () => {
    if (updating || completed) return;
    try {
      setUpdating(true);
      await userAPI.updateProgress(lessonId, 100);
      setCompleted(true);
    } catch (error) {
      console.error('Update progress error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(answers).length < (lesson.questions?.length || 0)) {
      alert("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }
    
    try {
      setUpdating(true);
      const res = await userAPI.submitQuiz(lessonId, { answers });
      setQuizResult(res.data);
      if (res.data.isCompleted) {
        setCompleted(true);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งคำตอบ");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextLessonId = course?.lessons?.find((l, idx, arr) => {
    const currentIdx = arr.findIndex(item => item.id === lessonId);
    return idx === currentIdx + 1;
  })?.id;

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto md:px-4 md:py-6 relative min-h-screen pb-24 md:pb-12">
      
      {/* Immersive Header / Media Section */}
      <div className="relative w-full bg-slate-900 md:rounded-[2.5rem] overflow-hidden shadow-2xl z-20 group">
        {/* Back Button Overlay - Floating Glass */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Media Content */}
        <div className={`${lesson.type === 'quiz' ? '' : 'aspect-video'} w-full`}>
          {lesson.type === 'video' ? (
            <VideoPlayer
              key={lesson.contentUrl}
              url={lesson.contentUrl?.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
              onEnded={handleComplete}
            />
          ) : lesson.type === 'quiz' ? (
            <div className="flex flex-col items-center gap-6 text-white px-6 py-20 md:py-32 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-black z-0"></div>
              {/* Decorative mesh elements */}
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
              
              <div className="relative z-10 w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl transform transition-transform duration-700 hover:rotate-3">
                 <FileText size={48} strokeWidth={1} />
              </div>
              <div className="relative z-10 max-w-lg">
                 <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tighter">Knowledge Check</h2>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">ทดสอบความเข้าใจของคุณเกี่ยวกับบทเรียนนี้ เพื่อปลดล็อกเนื้อหาถัดไป</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 py-20 md:py-32 text-center bg-slate-950 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-primary backdrop-blur-xl shadow-2xl relative z-10">
                <BookOpen size={40} strokeWidth={1.5} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Documentary Lesson</p>
                <button
                  onClick={() => window.open(getFullUrl(lesson.contentUrl), '_blank')}
                  className="btn btn-primary px-10 py-4 text-base rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:scale-105"
                >
                  เปิดอ่านเอกสารบทเรียน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section - Professional & Clear */}
      <div className="bg-white md:bg-transparent px-6 py-10 md:px-0 md:py-12 relative z-10">
        
        {/* Lesson Metadata */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                {lesson.type === 'video' ? <Play size={12} fill="currentColor"/> : <FileText size={12}/>} {lesson.type || 'Video'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                <Clock size={12}/> {lesson.duration || '10'}m
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">{lesson.title}</h1>
          </div>
          
          {completed && (
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm animate-fade-in shrink-0">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle size={14} strokeWidth={3} />
              </div>
              <span className="text-sm font-bold text-emerald-700">Completed</span>
            </div>
          )}
        </div>

        <div className="h-px w-full bg-slate-100 mb-12"></div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {lesson.type === 'quiz' ? (
              <div className="flex flex-col gap-8">
                {!quizResult && (
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-start gap-5 shadow-2xl">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0 font-black border border-primary/20">i</div>
                    <div>
                      <p className="font-bold text-white mb-1">เกณฑ์การผ่านบทเรียน</p>
                      <p className="text-sm text-slate-400 leading-relaxed">คุณต้องได้คะแนนอย่างน้อย {lesson.passScore || 60}% ({Math.ceil((lesson.passScore || 60)/100 * (lesson.questions?.length || 0))} ข้อ) จากทั้งหมด {lesson.questions?.length || 0} ข้อ</p>
                    </div>
                  </div>
                )}

                {quizResult && (
                  <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 animate-celebrate shadow-2xl flex flex-col items-center gap-4 text-center ${
                    quizResult.passed ? 'bg-white border-emerald-100' : 'bg-red-50/50 border-red-100'
                  }`}>
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl mb-2 ${quizResult.passed ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}>
                        {quizResult.passed ? <CheckCircle size={40} strokeWidth={2.5}/> : <div className="text-3xl font-black">!</div>}
                     </div>
                     <h3 className={`text-3xl font-black tracking-tighter ${quizResult.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                       {quizResult.passed ? 'Excellent Job!' : 'Keep Practicing'}
                     </h3>
                     <div className="flex flex-col">
                        <p className="text-5xl font-black text-slate-900">{quizResult.scorePercent}%</p>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Your Score</p>
                     </div>
                     
                     <button onClick={() => { setQuizResult(null); setAnswers({}); }} className="mt-4 px-8 py-3 rounded-xl font-bold transition-all border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm">
                       {quizResult.passed ? 'Retry to Review' : 'Try Again'}
                     </button>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {lesson.questions?.map((q, idx) => {
                    const isSubmitted = !!quizResult;
                    const userA = answers[q.id];
                    const correctA = quizResult?.correctAnswers?.[q.id];
                    const isCorrect = userA === correctA;
                    const isWrong = userA && userA !== correctA;
                    
                    return (
                      <div key={q.id} className={`bg-white border-2 rounded-[2rem] p-8 transition-all ${isSubmitted && isWrong ? 'border-red-100 bg-red-50/10' : isSubmitted && isCorrect ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-8">
                          <h4 className="text-lg font-bold text-slate-900 leading-relaxed flex gap-4">
                            <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">{idx + 1}</span>
                            {q.text}
                          </h4>
                        </div>
                        <div className="flex flex-col gap-3">
                          {q.choices.map(c => {
                            let choiceState = "normal";
                            if (isSubmitted) {
                              if (c.id === correctA) choiceState = "correct";
                              else if (c.id === userA) choiceState = "wrong";
                              else choiceState = "untouched";
                            } else if (userA === c.id) {
                              choiceState = "selected";
                            }

                            return (
                              <label
                                key={c.id}
                                onClick={() => !isSubmitted && setAnswers({ ...answers, [q.id]: c.id })}
                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                  choiceState === "selected" ? "border-primary bg-primary/5 ring-4 ring-primary/5" :
                                  choiceState === "correct" ? "border-emerald-500 bg-emerald-50" :
                                  choiceState === "wrong" ? "border-red-400 bg-red-50 opacity-80" :
                                  choiceState === "untouched" ? "border-slate-50 bg-slate-50 opacity-40 grayscale" :
                                  "border-slate-100 hover:border-slate-300"
                                } hover:scale-[1.01] active:scale-[0.99]`}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  choiceState === "selected" ? "border-primary bg-primary text-white" :
                                  choiceState === "correct" ? "border-emerald-500 bg-emerald-500 text-white" :
                                  choiceState === "wrong" ? "border-red-400 bg-red-400 text-white" :
                                  "border-slate-300 bg-white"
                                }`}>
                                  {choiceState === "selected" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  {choiceState === "correct" && <CheckCircle size={14} strokeWidth={3} />}
                                  {choiceState === "wrong" && <span className="text-[10px] font-black">X</span>}
                                </div>
                                <span className={`text-[15px] font-medium leading-tight ${choiceState === 'normal' ? 'text-slate-700' : 'text-slate-900 font-bold'}`}>{c.text}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="prose prose-slate prose-lg max-w-none">
                <p className="text-lg text-slate-600 leading-loose whitespace-pre-wrap font-medium">
                  {lesson.content || 'เนื้อหาเพิ่มเติมสำหรับบทเรียนนี้...'}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Resources Column */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 sticky top-8">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Downloadables
                </h4>
                <div className="flex flex-col gap-3">
                  {lesson.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <FileText size={20} strokeWidth={2.5}/>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 line-clamp-1">{res.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{res.size || 'External Link'}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement Card - "Expensive Looking" */}
            {completed && (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 text-center shadow-2xl shadow-emerald-500/5 relative overflow-hidden animate-celebrate animate-fade-in">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_25px_rgba(16,185,129,0.3)] transform rotate-3">
                    <CheckCircle size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">บทเรียนสำเร็จแล้ว!</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">คุณได้รับความรู้และความเข้าใจที่ยอดเยี่ยมในหัวข้อนี้</p>
                  
                  {nextLessonId && (
                    <button
                      onClick={() => navigate(`/user/course/${courseId}/lesson/${nextLessonId}`)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                      เรียนบทถัดไป →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 md:hidden flex gap-3 animate-fade-in shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {completed && nextLessonId ? (
          <button
            onClick={() => navigate(`/user/course/${courseId}/lesson/${nextLessonId}`)}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl"
          >
            เริ่มบทถัดไป
          </button>
        ) : lesson.type === 'quiz' && !quizResult ? (
          <button
            onClick={handleQuizSubmit}
            disabled={updating || Object.keys(answers).length < (lesson.questions?.length || 0)}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {updating ? 'กำลังตรวจ...' : 'ส่งคำตอบ'}
          </button>
        ) : !completed && lesson.type !== 'quiz' ? (
          <button
            onClick={handleComplete}
            disabled={updating}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} strokeWidth={2.5} /> {updating ? 'กำลังบันทึก...' : 'เรียนจบแล้ว'}
          </button>
        ) : quizResult && !quizResult?.passed ? (
          <button
            onClick={() => { setQuizResult(null); setAnswers({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl"
          >
            ลองทำใหม่อีกครั้ง
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[13px] tracking-widest uppercase"
          >
            ย้อนกลับ
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;
