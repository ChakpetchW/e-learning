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

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] -m-4 sm:m-0 sm:rounded-2xl overflow-hidden animate-fade-in relative w-full lg:max-w-5xl xl:max-w-6xl mx-auto shadow-2xl">

      <div className="absolute top-0 w-full p-4 flex justify-between items-start z-40 bg-gradient-to-b from-black/60 to-transparent pb-8 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors pointer-events-auto"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className={`relative w-full ${lesson.type === 'quiz' ? 'pt-8 pb-12' : 'aspect-video'} bg-[#0e0e0e] flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-30"></div>
        {lesson.type === 'video' ? (
          <VideoPlayer
            key={lesson.contentUrl}
            url={lesson.contentUrl?.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
            onEnded={handleComplete}
          />
        ) : lesson.type === 'quiz' ? (
          <div className="flex flex-col items-center gap-4 text-gray-200 p-8 text-center pt-8 z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/30 transform rotate-3">
               <FileText size={40} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white mb-2 tracking-tight">แบบทดสอบ</h2>
               <p className="text-[13px] text-gray-400 font-medium">มาทดสอบความรู้ที่คุณได้เรียนมากันเถอะ</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-gray-400 p-8 text-center z-10">
            <div className="w-20 h-20 bg-gray-800/80 rounded-2xl flex items-center justify-center text-primary border border-gray-700 shadow-xl backdrop-blur-sm">
              <FileText size={40} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white mb-2">บทเรียนรูปแบบเอกสาร</p>
              <p className="text-xs text-gray-500 mb-6">คลิกปุ่มด้านล่างเพื่อเปิดอ่านเนื้อหา</p>
              <button
                onClick={() => window.open(getFullUrl(lesson.contentUrl), '_blank')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-lg shadow-primary/20"
              >
                <BookOpen size={18} /> เปิดอ่านเอกสาร
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 bg-white p-6 ${lesson.type === 'quiz' ? 'rounded-t-[32px]' : 'rounded-t-3xl'} -mt-4 relative z-20 sm:rounded-none sm:mt-0 flex flex-col min-h-[50vh]`}>
        <div className="w-12 h-1.5 bg-gray-200/80 rounded-full mx-auto mb-6"></div>

        <div className="flex justify-between items-start mb-3">
          <h1 className="text-xl font-black text-gray-900 leading-tight pr-4">{lesson.title}</h1>
          {completed && (
            <span className="bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg block shrink-0 border border-success/20">
              Completed
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            {lesson.type === 'video' ? <Play size={12} /> : <FileText size={12} />} {lesson.type || 'Video'}
          </span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> {lesson.duration || '10'}m
          </span>
        </div>

        {lesson.type === 'quiz' ? (
          <div className="flex flex-col gap-6 mb-8 mt-2">
            {!quizResult && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold shadow-md shadow-blue-500/20">i</div>
                <div>
                  <p className="font-bold text-blue-900 mb-1 text-sm">การทดสอบท้ายบทเรียน</p>
                  <p className="text-[13px] text-blue-700/80 font-medium">คุณต้องสอบผ่าน {lesson.passScore || 60}% ขึ้นไปจากข้อสอบทั้งหมด {lesson.questions?.length || 0} ข้อ เพื่อผ่านบทเรียนนี้ ถ้าไม่ผ่านสามารถทำใหม่ได้</p>
                </div>
              </div>
            )}

            {quizResult && (
              <div className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 text-center animate-fade-in ${
                quizResult.passed ? 'bg-success/5 border-success/20' : 'bg-red-50 border-red-200/60'
              }`}>
                 <h3 className={`font-black text-2xl tracking-tight ${quizResult.passed ? 'text-success' : 'text-red-500'}`}>
                   {quizResult.passed ? 'คุณสอบผ่าน! 🎉' : 'คุณสอบไม่ผ่าน 😢'}
                 </h3>
                 <p className="font-bold text-gray-800 text-3xl my-1">{quizResult.scorePercent}%</p>
                 <p className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-md border border-gray-100 shadow-sm">เกณฑ์การผ่านคือ {quizResult.passScore || lesson.passScore || 60}%</p>
                 
                 <button onClick={() => { setQuizResult(null); setAnswers({}); }} className={`mt-4 px-6 py-2.5 rounded-xl font-bold shadow-sm text-sm transition-colors border ${
                   quizResult.passed ? 'bg-white text-primary border-primary/20 hover:bg-primary/5' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'
                 }`}>
                   {quizResult.passed ? 'ทำแบบทดสอบอีกครั้งเพื่อดูข้อที่ถูก' : 'ลองทำใหม่อีกครั้ง'}
                 </button>
              </div>
            )}

            {lesson.questions?.map((q, idx) => {
               const isSubmitted = !!quizResult;
               const userA = answers[q.id];
               const correctA = quizResult?.correctAnswers?.[q.id];
               const isCorrect = userA === correctA;
               const isWrong = userA && userA !== correctA;
               
               return (
               <div key={q.id} className={`bg-white border rounded-2xl p-5 shadow-sm overflow-hidden ${isSubmitted && isWrong ? 'border-red-200' : isSubmitted && isCorrect ? 'border-green-200' : 'border-gray-200'}`}>
                 <div className="flex justify-between items-start mb-5">
                   <p className="font-bold text-gray-900 leading-relaxed text-[15px]"><span className={`mr-2 px-2 py-0.5 rounded text-sm ${isSubmitted && isCorrect ? 'bg-green-100 text-green-700' : isSubmitted && isWrong ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>{idx+1}</span>{q.text}</p>
                   {isSubmitted && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isCorrect ? '+'+q.points : '0'} / {q.points} Pts
                      </span>
                   )}
                 </div>
                 <div className="flex flex-col gap-2.5">
                   {q.choices.map(c => {
                      let choiceClass = "bg-gray-50 border-transparent text-gray-700";
                      let radioClass = "border-gray-300 bg-white";
                      let showCheck = false;
                      
                      if (!isSubmitted) {
                         if (answers[q.id] === c.id) {
                            choiceClass = "bg-primary/5 border-primary text-primary font-bold shadow-sm shadow-primary/5";
                            radioClass = "border-primary";
                            showCheck = true;
                         } else {
                            choiceClass += " hover:border-gray-300 hover:bg-gray-100";
                         }
                      } else {
                         if (c.id === correctA) {
                            choiceClass = "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm";
                            radioClass = "border-green-500 bg-green-500 text-white flex items-center justify-center";
                         } else if (c.id === userA && c.id !== correctA) {
                            choiceClass = "bg-red-50 border-red-400 text-red-800 font-bold opacity-80";
                            radioClass = "border-red-400 bg-red-400 text-white flex items-center justify-center";
                         } else {
                            choiceClass = "bg-gray-50 border-transparent text-gray-400 opacity-60";
                            radioClass = "border-gray-200 bg-gray-100";
                         }
                      }

                      return (
                      <label key={c.id} onClick={() => !isSubmitted && setAnswers({ ...answers, [q.id]: c.id })} className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${!isSubmitted ? 'cursor-pointer' : 'cursor-default'} ${choiceClass}`}>
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${radioClass}`}>
                            {!isSubmitted && showCheck && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                            {isSubmitted && c.id === correctA && <CheckCircle size={14} className="text-white" strokeWidth={3} />}
                            {isSubmitted && c.id === userA && c.id !== correctA && <span className="text-white font-bold text-[10px]">X</span>}
                         </div>
                         <span className="text-[14px] leading-tight select-none">{c.text}</span>
                      </label>
                      );
                   })}
                 </div>
               </div>
               );
            })}
          </div>
        ) : (
          <div className="prose prose-sm prose-gray max-w-none mb-8">
            <p className="text-[15px] text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
              {lesson.content || 'เนื้อหาเพิ่มเติมสำหรับบทเรียนนี้...'}
            </p>
          </div>
        )}

        {/* Resources section */}
        {lesson.type !== 'quiz' && (
          <div className="mt-2 mb-8">
            {lesson.resources && lesson.resources.length > 0 && <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">เอกสารประกอบ</h4>}
            {lesson.resources && lesson.resources.length > 0 ? lesson.resources.map((res, i) => (
              <a
                key={i}
                href={res.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group mb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{res.title}</p>
                    <p className="text-[11px] font-bold text-gray-400">{res.size || 'External Link'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                  เปิดลิงก์ <ChevronRight size={14} />
                </span>
              </a>
            )) : null}
          </div>
        )}

        <div className="mt-auto pt-4">
          {lesson.type === 'quiz' && !quizResult ? (
            <button
              onClick={handleQuizSubmit}
              disabled={updating || Object.keys(answers).length < (lesson.questions?.length || 0)}
              className="btn bg-primary text-white hover:bg-primary-hover w-full py-4 text-[15px] rounded-xl shadow-lg border border-primary transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {updating ? 'กำลังตรวจคำตอบ...' : 'ส่งคำตอบ'}
            </button>
          ) : lesson.type === 'quiz' && (completed || quizResult?.passed) ? (
            <div className="flex flex-col gap-3">
               <div className="bg-success/10 border border-success/20 text-success p-5 rounded-2xl text-center animate-fade-in flex flex-col items-center gap-3 shadow-inner">
                <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center shadow-lg shadow-success/30 transform scale-up-center">
                  <CheckCircle size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900">คุณเรียนจบบทนี้แล้ว!</h3>
                </div>
              </div>
              <button
                onClick={() => { setQuizResult(null); setAnswers({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="btn bg-white text-primary hover:bg-primary/5 w-full py-4 text-[15px] rounded-xl shadow-md border-2 border-primary/20 transition-all flex items-center justify-center font-bold"
              >
                ทำแบบทดสอบอีกครั้งเพื่อทบทวน
              </button>
            </div>
          ) : !completed && lesson.type !== 'quiz' ? (
            <button
              onClick={handleComplete}
              disabled={updating}
              className="btn bg-gray-900 text-white hover:bg-black w-full py-4 text-[15px] rounded-xl shadow-lg border border-gray-800 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-75"
            >
              <CheckCircle size={20} /> {updating ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าเรียนจบ'}
            </button>
          ) : completed && lesson.type !== 'quiz' ? (
            <div className="bg-success/10 border border-success/20 text-success p-5 rounded-2xl text-center animate-fade-in flex flex-col items-center gap-3 shadow-inner">
              <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center shadow-lg shadow-success/30 transform scale-up-center">
                <CheckCircle size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-xl text-gray-900">คุณเรียนจบบทนี้แล้ว!</h3>
              </div>
            </div>
          ) : quizResult && !quizResult?.passed ? (
            <button
              onClick={() => { setQuizResult(null); setAnswers({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="btn bg-white text-red-500 hover:bg-red-50 w-full py-4 text-[15px] rounded-xl shadow-lg border-2 border-red-200 transition-all flex items-center justify-center font-bold"
            >
              ลองทำใหม่อีกครั้ง
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
