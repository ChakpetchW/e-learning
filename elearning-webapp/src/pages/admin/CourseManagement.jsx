import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, FileText, Video, Layers, X, ChevronRight, Play, Upload, Clock, MonitorPlay, Infinity as InfinityIcon, PlayCircle, BookOpen, Image as ImageIcon } from 'lucide-react';
import { adminAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

// --- ROBUST SUB-COMPONENTS FOR PREMIUM LISTS ---

const OutcomeListEditor = ({ value, onChange }) => {
  const tryParse = (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };
  
  const items = tryParse(value);

  const update = (newItems) => onChange(JSON.stringify(newItems));

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 group">
          <input 
            className="form-input flex-1 bg-white text-base py-3 border-emerald-100 focus:border-emerald-400" 
            value={item} 
            placeholder="เช่น หลักการออกแบบ UX/UI เบื้องต้น..."
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value;
              update(newItems);
            }}
          />
          <button type="button" onClick={() => update(items.filter((_, i) => i !== idx))} 
            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-all">
            <Trash2 size={20}/>
          </button>
        </div>
      ))}
      <button type="button" onClick={() => update([...items, ""])} 
        className="text-sm font-black text-emerald-600 hover:bg-emerald-50 px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-200 block w-full text-center transition-all">
        + เพิ่มสิ่งที่จะได้เรียนรู้ใหม่
      </button>
    </div>
  );
};

const BenefitListEditor = ({ value, onChange }) => {
  const tryParse = (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => (typeof item === 'string' || item === null) ? { icon: 'MonitorPlay', text: item || '' } : item);
    } catch (e) { return []; }
  };
  
  const items = tryParse(value);
  const update = (newItems) => onChange(JSON.stringify(newItems));

  const IconCompMap = { MonitorPlay, FileText, InfinityIcon, Award, PlayCircle, BookOpen };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const IconComp = IconCompMap[item.icon || 'MonitorPlay'] || MonitorPlay;
        return (
          <div key={idx} className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <IconComp size={22} />
              </div>
              <select 
                className="bg-slate-100 border-none text-xs font-black rounded-lg py-1.5 px-3 cursor-pointer text-slate-600 uppercase tracking-tight focus:ring-0"
                value={item.icon || 'MonitorPlay'}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...item, icon: e.target.value };
                  update(newItems);
                }}
              >
                <option value="MonitorPlay">วิดีโอ (Video)</option>
                <option value="FileText">เอกสาร (File)</option>
                <option value="InfinityIcon">ตลอดชีพ (Lifetime)</option>
                <option value="Award">วุฒิบัตร (Award)</option>
                <option value="PlayCircle">การเล่น (Play)</option>
                <option value="BookOpen">บทเรียน (Lesson)</option>
              </select>
              <div className="flex-1"></div>
              <button type="button" onClick={() => update(items.filter((_, i) => i !== idx))}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={20}/>
              </button>
            </div>
            <input 
              className="form-input w-full border-none bg-slate-50 text-base py-3 px-4 rounded-xl focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all font-medium" 
              placeholder="เช่น รับวิดีโอคุณภาพระดับ Full HD..."
              value={item.text} 
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx] = { ...item, text: e.target.value };
                update(newItems);
              }}
            />
          </div>
        );
      })}
      <button type="button" onClick={() => update([...items, { icon: 'MonitorPlay', text: '' }])}
        className="text-sm font-black text-primary hover:bg-primary px-4 py-3 rounded-2xl border-2 border-dashed border-primary/20 hover:text-white block w-full text-center transition-all bg-primary/5">
        + เพิ่มสิทธิประโยชน์ที่จะได้รับ
      </button>
    </div>
  );
};
const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State - Course
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [courseForm, setCourseForm] = useState({ 
    title: '', 
    description: '', 
    categoryId: '', 
    points: 100, 
    image: '',
    instructorName: 'ทีมงานวิทยากรผู้เชี่ยวชาญ',
    instructorRole: 'Enterprise Instructor',
    instructorBio: 'ทีมงานผู้มีความเชี่ยวชาญเฉพาะด้านที่ผ่านประสบการณ์การทำงานในองค์กรชั้นนำ พร้อมถ่ายทอดทักษะระดับมืออาชีพให้คุณ',
    previewVideoUrl: '',
    totalDuration: '',
    whatYouWillLearn: '[]',
    whatYouWillGet: '[]',
    rating: 4.8,
    reviewCount: 1240,
    studentCount: 5000
  });
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'content' | 'reports'
  const [quizReports, setQuizReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Modal State - Lesson
  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', contentUrl: '', content: '', order: 0, points: 0, passScore: 60, questions: [] });

  // Modal State - Category
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', order: 0 });
  const [editingCatId, setEditingCatId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Handle image upload for course thumbnail
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    setUploading(true);
    try {
      const res = await adminAPI.uploadFile(file);
      setCourseForm({ ...courseForm, image: res.data.fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      alert('อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  // Handle document upload for lesson
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminAPI.uploadFile(file);
      setLessonForm({ ...lessonForm, contentUrl: res.data.fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      alert('อัปโหลดเอกสารไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        adminAPI.getCourses(),
        adminAPI.getCategories()
      ]);
      setCourses(courseRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminAPI.updateCourse(editingId, courseForm);
        alert('แก้ไขคอร์สสำเร็จ!');
      } else {
        await adminAPI.createCourse({ ...courseForm, status: 'PUBLISHED' });
        alert('สร้างคอร์สสำเร็จ!');
      }
      setShowModal(false);
      resetCourseForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({ 
      title: '', 
      description: '', 
      categoryId: '', 
      points: 100, 
      image: '',
      instructorName: 'ทีมงานวิทยากรผู้เชี่ยวชาญ',
      instructorRole: 'Enterprise Instructor',
      instructorBio: 'ทีมงานผู้มีความเชี่ยวชาญเฉพาะด้านที่ผ่านประสบการณ์การทำงานในองค์กรชั้นนำ พร้อมถ่ายทอดทักษะระดับมืออาชีพให้คุณ',
      previewVideoUrl: '',
      totalDuration: '',
      whatYouWillLearn: '[]',
      whatYouWillGet: '[]',
      rating: 4.8,
      reviewCount: 1240,
      studentCount: 5000
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const openEditCourse = async (course) => {
    setIsEditing(true);
    setEditingId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      categoryId: course.categoryId || '',
      points: course.points || 0,
      image: course.image || '',
      instructorName: course.instructorName || 'ทีมงานวิทยากรผู้เชี่ยวชาญ',
      instructorRole: course.instructorRole || 'Enterprise Instructor',
      instructorBio: course.instructorBio || '',
      previewVideoUrl: course.previewVideoUrl || '',
      totalDuration: course.totalDuration || '',
      whatYouWillLearn: course.whatYouWillLearn || '[]',
      whatYouWillGet: course.whatYouWillGet || '[]',
      rating: course.rating || 4.8,
      reviewCount: course.reviewCount || 1240,
      studentCount: course.studentCount || 5000
    });
    setActiveTab('basic');
    setShowModal(true);
    fetchLessons(course.id);
  };

  const fetchLessons = async (courseId) => {
    try {
      const response = await adminAPI.getLessons(courseId);
      setLessons(response.data);
    } catch (error) {
      console.error('Fetch lessons error:', error);
    }
  };

  const fetchQuizReports = async (courseId) => {
    try {
      setLoadingReports(true);
      const res = await adminAPI.getCourseQuizReports(courseId);
      setQuizReports(res.data);
    } catch (error) {
      console.error('Fetch quiz reports error:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await adminAPI.updateLesson(editingLesson.id, lessonForm);
      } else {
        await adminAPI.createLesson({ ...lessonForm, courseId: editingId });
      }
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonForm({ title: '', type: 'video', contentUrl: '', content: '', order: 0, points: 0, passScore: 60, questions: [] });
      fetchLessons(editingId);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกเนื้อหา');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (confirm('ยืนยันการลบบทเรียนนี้?')) {
      try {
        await adminAPI.deleteLesson(lessonId);
        fetchLessons(editingId);
      } catch (error) {
        alert('ลบไม่สำเร็จ');
      }
    }
  };

  const openAddCourse = () => {
    resetCourseForm();
    setShowModal(true);
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await adminAPI.updateCategory(editingCatId, catForm);
      } else {
        await adminAPI.createCategory(catForm);
      }
      setCatForm({ name: '', order: 0 });
      setEditingCatId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการจัดการหมวดหมู่');
    }
  };

  const handleDeleteCat = async (id) => {
    if (confirm('ยืนยันการลบหมวดหมู่? (คอร์สในหมวดนี้อาจได้รับผลกระทบ)')) {
      try {
        await adminAPI.deleteCategory(id);
        fetchData();
      } catch (error) {
        alert('ลบไม่สำเร็จ กรุณาตรวจสอบว่ามีคอร์สค้างอยู่ในหมวดนี้หรือไม่');
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบคอร์สเรียนนี้?')) {
      try {
        await adminAPI.deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
      } catch (error) {
        console.error('Delete course error', error);
        alert('ลบคอร์สไม่สำเร็จ');
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">จัดการคอร์สเรียน</h2>
          <p className="text-muted text-sm">เพิ่ม ลบ หรือแก้ไขข้อมูลคอร์สเรียนในระบบ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatModal(true)} className="btn btn-outline">
            หมวดหมู่
          </button>
          <button onClick={openAddCourse} className="btn btn-primary">
            <Plus size={18} /> สร้างคอร์สใหม่
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:p-8 backdrop-blur-sm animate-fade-in overflow-hidden">
          <div className="card bg-white w-full max-w-6xl h-full overflow-hidden shadow-xl flex flex-col m-auto border border-gray-100">
            {/* Header & Tabs */}
            <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold">{isEditing ? 'แก้ไขคอร์สเรียน' : 'สร้างคอร์สใหม่'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-gray-900"><X size={20} /></button>
            </div>

            {isEditing && (
              <div className="flex border-b border-border px-4 bg-white">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`py-3 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'}`}
                >
                  ข้อมูลทั่วไป
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-3 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'}`}
                >
                  เนื้อหาหลักสูตร ({lessons.length})
                </button>
                <button
                  onClick={() => { setActiveTab('reports'); fetchQuizReports(editingId); }}
                  className={`py-3 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'}`}
                >
                  รายงานผลสอบ
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {activeTab === 'reports' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-gray-800">ประวัติการทำแบบทดสอบในคอร์สนี้ทั้งหมด ({quizReports.length} รายการ)</p>
                  </div>
                  
                  {loadingReports ? (
                    <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  ) : quizReports.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-muted">
                            <th className="p-3 font-medium">ชื่อผู้ใช้</th>
                            <th className="p-3 font-medium">อีเมล</th>
                            <th className="p-3 font-medium">แผนก</th>
                            <th className="p-3 font-medium">บททดสอบ</th>
                            <th className="p-3 font-medium text-center">คะแนน</th>
                            <th className="p-3 font-medium text-center">ผลลัพธ์</th>
                            <th className="p-3 font-medium text-right">วันเวลาที่ส่ง</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quizReports.map((report) => (
                            <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="p-3 font-medium">{report.user.name}</td>
                              <td className="p-3 text-muted">{report.user.email}</td>
                              <td className="p-3 max-w-[120px] truncate" title={report.user.department}>{report.user.department || '-'}</td>
                              <td className="p-3 text-muted truncate max-w-[150px]">{report.lesson.title}</td>
                              <td className="p-3 text-center font-bold">
                                {report.score}% 
                                <span className="text-[10px] text-gray-400 font-normal ml-1">(เกณฑ์ {report.lesson.passScore || 60}%)</span>
                              </td>
                              <td className="p-3 text-center">
                                {report.status === 'PASSED' ? (
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">ผ่าน</span>
                                ) : (
                                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">ไม่ผ่าน</span>
                                )}
                              </td>
                              <td className="p-3 text-right text-muted text-xs">
                                {new Date(report.createdAt).toLocaleString('th-TH')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                      <FileText size={32} className="mb-2 opacity-20" />
                      <p className="text-sm">ยังไม่มีประวัติการทำแบบทดสอบในคอร์สนี้</p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'basic' ? (
                <form onSubmit={handleSaveCourse} className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">ชื่อคอร์ส</label>
                    <input required type="text" className="form-input w-full" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">หมวดหมู่</label>
                    <select required className="form-input w-full" value={courseForm.categoryId} onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}>
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">แต้มรางวัล (Points)</label>
                    <input type="number" className="form-input w-full" value={courseForm.points} onChange={(e) => setCourseForm({ ...courseForm, points: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">รูปหน้าปกคอร์ส</label>
                    <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

                    {courseForm.image ? (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src={courseForm.image ? getFullUrl(courseForm.image) : DEFAULT_COURSE_IMAGE}
                          alt="Course thumbnail"
                          className="w-full h-40 object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex gap-2 p-2 bg-white border-t border-gray-100">
                          <button type="button" onClick={() => imageInputRef.current?.click()} className="btn btn-outline btn-sm flex-1 text-xs" disabled={uploading}>
                            <Upload size={14} /> เปลี่ยนรูป
                          </button>
                          <button type="button" onClick={() => setCourseForm({ ...courseForm, image: '' })} className="btn btn-outline btn-sm text-xs text-danger border-danger/30">
                            <Trash2 size={14} /> ลบ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-xs font-bold">กำลังอัปโหลด...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={32} />
                            <span className="text-xs font-bold">คลิกเพื่ออัปโหลดรูปหน้าปก</span>
                            <span className="text-[10px]">รองรับ JPG, PNG, WebP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">รายละเอียด (Description)</label>
                    <textarea rows={3} className="form-input w-full" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="คำอธิบายสั้นๆ ของคอร์สนี้..." />
                  </div>

                  {/* Group: Instructor & Metadata (Premium Fields) */}
                  <div className="mt-4 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Layers size={16}/> รายละเอียดหลักสูตรเพิ่มเติม (Premium Display)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Instructor */}
                      <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                           ข้อมูลผู้สอน
                        </p>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อผู้สอน</label>
                          <input type="text" placeholder="ชื่อ-นามสกุล" className="form-input w-full bg-white text-base py-2.5" value={courseForm.instructorName} onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">ตำแหน่ง (Role)</label>
                          <input type="text" placeholder="เช่น Enterprise Instructor" className="form-input w-full bg-white text-base py-2.5" value={courseForm.instructorRole} onChange={(e) => setCourseForm({ ...courseForm, instructorRole: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">ประวัติย่อ (Bio)</label>
                          <textarea placeholder="แนะนำตัวผู้สอนสั้นๆ..." rows={3} className="form-input w-full bg-white text-base py-2.5" value={courseForm.instructorBio} onChange={(e) => setCourseForm({ ...courseForm, instructorBio: e.target.value })} />
                        </div>
                      </div>

                      {/* Video & Stats */}
                      <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm font-black text-slate-400 uppercase mb-3">สื่อและสถิติหลักสูตร</p>
                        <div>
                          <label className="text-sm font-bold text-slate-600 block mb-1.5">วิดีโอตัวอย่าง (YouTube URL)</label>
                          <div className="flex items-center gap-2">
                            <Video size={18} className="text-slate-400" />
                            <input type="text" placeholder="https://youtube.com/..." className="form-input flex-1 bg-white text-base py-3" value={courseForm.previewVideoUrl} onChange={(e) => setCourseForm({ ...courseForm, previewVideoUrl: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-600 block mb-1.5">ความยาวคอร์สทั้งหมด</label>
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            <input type="text" placeholder="เช่น 24 ชั่วโมง หรือ 120 นาที" className="form-input flex-1 bg-white text-base py-3" value={courseForm.totalDuration} onChange={(e) => setCourseForm({ ...courseForm, totalDuration: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                           <div>
                             <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">เรตติ้ง (0-5)</label>
                             <input type="number" step="0.1" placeholder="4.8" className="form-input w-full bg-white text-base py-2.5" value={courseForm.rating} onChange={(e) => setCourseForm({ ...courseForm, rating: e.target.value })} />
                           </div>
                           <div>
                             <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">รีวิว (คน)</label>
                             <input type="number" placeholder="1240" className="form-input w-full bg-white text-base py-2.5" value={courseForm.reviewCount} onChange={(e) => setCourseForm({ ...courseForm, reviewCount: e.target.value })} />
                           </div>
                           <div>
                             <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ผู้เรียน (คน)</label>
                             <input type="number" placeholder="5000" className="form-input w-full bg-white text-base py-2.5" value={courseForm.studentCount} onChange={(e) => setCourseForm({ ...courseForm, studentCount: e.target.value })} />
                           </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-2xl border-2 border-slate-100 mt-4">
                         {/* What You'll Learn Editor */}
                         <div className="space-y-4">
                            <label className="text-xl font-black text-slate-900 flex items-center gap-2">
                              <Plus size={22} className="text-emerald-500"/> สิ่งที่จะได้เรียนรู้ (Outcomes)
                            </label>
                            <OutcomeListEditor 
                              value={courseForm.whatYouWillLearn} 
                              onChange={(val) => setCourseForm({ ...courseForm, whatYouWillLearn: val })} 
                            />
                         </div>

                         {/* What You'll Get Editor */}
                         <div className="space-y-4">
                            <label className="text-xl font-black text-slate-900 flex items-center gap-2">
                              <Layers size={22} className="text-primary"/> สิ่งที่จะได้รับพิเศษ (Benefits)
                            </label>
                            <BenefitListEditor 
                              value={courseForm.whatYouWillGet} 
                              onChange={(val) => setCourseForm({ ...courseForm, whatYouWillGet: val })} 
                            />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1">ยกเลิก</button>
                    <button type="submit" className="btn btn-primary flex-1">บันทึกข้อมูลคอร์ส</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-muted uppercase">บทเรียนทั้งหมด</p>
                    <button type="button" onClick={() => { setEditingLesson(null); setLessonForm({ title: '', type: 'video', contentUrl: '', content: '', order: lessons.length + 1, points: 0, passScore: 60, questions: [] }); setShowLessonModal(true); }} className="btn btn-primary btn-sm rounded-lg text-xs">
                      + เพิ่มบทเรียน
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:border-primary/20 hover:shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 font-bold text-xs text-muted">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {lesson.type === 'video' ? <Play size={12} className="text-primary" /> : <FileText size={12} className="text-blue-500" />}
                            <h4 className="text-sm font-bold truncate">{lesson.title}</h4>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate font-medium">{lesson.contentUrl || 'ไม่มีที่อยู่ไฟล์'}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingLesson(lesson); setLessonForm(lesson); setShowLessonModal(true); }} className="p-1.5 hover:bg-white rounded transition-colors text-primary"><Edit size={14} /></button>
                          <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 hover:bg-white rounded transition-colors text-danger"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {lessons.length === 0 && (
                      <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                        <Layers size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">ยังไม่มีเนื้อหาในคอร์สนี้</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nested Modal for Lesson Add/Edit */}
          {showLessonModal && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 lg:p-8 backdrop-blur-sm animate-fade-in overflow-hidden">
              <div className="card bg-white w-full max-w-6xl h-full p-0 shadow-2xl overflow-hidden flex flex-col border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h4 className="text-lg font-bold">{editingLesson ? 'แก้ไขบทเรียน' : 'เพิ่มบทเรียนใหม่'}</h4>
                  <button onClick={() => setShowLessonModal(false)} className="text-muted hover:text-gray-900"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveLesson} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">ชื่อบทเรียน/บทที่</label>
                        <input required type="text" className="form-input w-full" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="เช่น บทนำเครื่องจักร" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">ประเภทเนื้อหา</label>
                        <select className="form-input w-full" value={lessonForm.type} onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}>
                          <option value="video">วิดีโอ (YouTube/Embed)</option>
                          <option value="pdf">เอกสาร (PDF/Link)</option>
                          <option value="article">บทความเนื้อหา</option>
                          <option value="quiz">แบบทดสอบ (Quiz)</option>
                        </select>
                      </div>
                      {lessonForm.type !== 'quiz' ? (
                        <>
                          <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1">
                              {lessonForm.type === 'video' ? 'ลิงก์วิดีโอ YouTube' : 'ไฟล์เอกสาร'}
                            </label>
                            {lessonForm.type === 'video' ? (
                              <input type="text" className="form-input w-full" value={lessonForm.contentUrl} onChange={e => setLessonForm({ ...lessonForm, contentUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                            ) : (
                              <div className="flex flex-col gap-2">
                                <input type="file" ref={docInputRef} onChange={handleDocUpload} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
                                <div className="flex gap-2">
                                  <input type="text" className="form-input flex-1 font-mono text-xs" value={lessonForm.contentUrl} onChange={e => setLessonForm({ ...lessonForm, contentUrl: e.target.value })} placeholder="URL หรืออัปโหลดไฟล์" readOnly={uploading} />
                                  <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploading} className="btn btn-outline btn-sm shrink-0 gap-1">
                                    {uploading ? (
                                      <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    ) : (
                                      <Upload size={14} />
                                    )}
                                    อัปโหลด
                                  </button>
                                </div>
                                {lessonForm.contentUrl && lessonForm.contentUrl.startsWith('/uploads') && (
                                  <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                    <FileText size={12} /> อัปโหลดไฟล์แล้ว
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 block mb-1">เนื้อหาบทเรียน (Text/Content)</label>
                            <textarea
                              rows={8}
                              className="form-input w-full font-mono text-sm"
                              value={lessonForm.content || ''}
                              onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                              placeholder="เขียนเนื้อหาบทเรียนที่นี่ (รองรับข้อความดิบหรือคำอธิบาย)..."
                            />
                            <p className="text-[10px] text-muted mt-1">คุณสามารถเขียนเนื้อหาบรรยายประกอบ หรือใส่รายละเอียดเพิ่มเติมที่นี่เพื่อให้ผู้เรียนอ่านได้โดยไม่ต้องเปิดไฟล์แยก</p>
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-2 flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-2 relative">
                          <div className="flex justify-between items-center border-b pb-3">
                            <h5 className="font-bold text-lg text-primary">สเปคแบบทดสอบ (Quiz Builder)</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-sm font-bold text-gray-700 block mb-1">คะแนนรวมที่จะได้รับ (Points)</label>
                               <input type="number" className="form-input w-full" value={lessonForm.points} onChange={e => setLessonForm({...lessonForm, points: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                               <label className="text-sm font-bold text-gray-700 block mb-1">เกณฑ์สอบผ่าน (Pass Score %)</label>
                               <input type="number" className="form-input w-full" value={lessonForm.passScore} onChange={e => setLessonForm({...lessonForm, passScore: parseInt(e.target.value) || 0})} />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-bold text-gray-700">ข้อสอบทั้งหมด ({lessonForm.questions?.length || 0} ข้อ)</label>
                              <button type="button" onClick={() => {
                                const newQ = { id: Date.now().toString(), text: '', points: 1, choices: [{id: Date.now()+'_c1', text: '', isCorrect: true}, {id: Date.now()+'_c2', text: '', isCorrect: false}] };
                                setLessonForm({...lessonForm, questions: [...(lessonForm.questions || []), newQ]});
                              }} className="btn btn-primary btn-sm rounded-lg"> + เพิ่มข้อ</button>
                            </div>

                            <div className="flex flex-col gap-4">
                              {(lessonForm.questions || []).map((q, qIndex) => (
                                <div key={q.id || qIndex} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex flex-col gap-3 relative">
                                  <button type="button" onClick={() => {
                                    const qs = [...lessonForm.questions]; qs.splice(qIndex, 1); setLessonForm({...lessonForm, questions: qs});
                                  }} className="absolute top-2 right-2 text-red-500 p-1.5 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                  <div className="flex gap-2 items-start pr-8">
                                     <span className="font-bold text-gray-400 shrink-0 mt-2">{qIndex+1}.</span>
                                     <input type="text" className="form-input flex-1" placeholder="คำถาม..." value={q.text} onChange={e => {
                                       const qs = [...lessonForm.questions]; qs[qIndex].text = e.target.value; setLessonForm({...lessonForm, questions: qs});
                                     }} />
                                     <input type="number" className="form-input w-24 shrink-0" placeholder="คะแนน" value={q.points} onChange={e => {
                                       const qs = [...lessonForm.questions]; qs[qIndex].points = parseInt(e.target.value)||0; setLessonForm({...lessonForm, questions: qs});
                                     }} title="คะแนนของข้อนี้" />
                                  </div>
                                  
                                  <div className="pl-6 flex flex-col gap-2 relative mt-2">
                                    <div className="absolute left-[3px] top-0 bottom-0 w-px bg-gray-200"></div>
                                    {q.choices.map((c, cIndex) => (
                                      <div key={c.id || cIndex} className="flex gap-2 items-center relative z-10 pl-4 border-l-2 border-transparent focus-within:border-primary transition-colors">
                                         <div className="absolute left-[-23px] w-4 h-px bg-gray-200"></div>
                                         <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-white border border-gray-300 rounded-full cursor-pointer hover:border-primary" onClick={() => {
                                            const qs = [...lessonForm.questions];
                                            qs[qIndex].choices.forEach(ch => ch.isCorrect = false);
                                            qs[qIndex].choices[cIndex].isCorrect = true;
                                            setLessonForm({...lessonForm, questions: qs});
                                         }}>
                                           {c.isCorrect && <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>}
                                         </div>
                                         <input type="text" className={`form-input flex-1 text-sm py-1.5 ${c.isCorrect ? 'border-green-300 bg-green-50/10 font-medium' : ''}`} placeholder={`ตัวเลือกที่ ${cIndex+1}`} value={c.text} onChange={e => {
                                           const qs = [...lessonForm.questions]; qs[qIndex].choices[cIndex].text = e.target.value; setLessonForm({...lessonForm, questions: qs});
                                         }} />
                                         <button type="button" onClick={() => {
                                           const qs = [...lessonForm.questions]; qs[qIndex].choices.splice(cIndex, 1); setLessonForm({...lessonForm, questions: qs});
                                         }} className="text-gray-400 hover:text-red-500 p-1"><X size={14}/></button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => {
                                       const qs = [...lessonForm.questions];
                                       qs[qIndex].choices.push({ id: Date.now()+'_c', text: '', isCorrect: qs[qIndex].choices.length === 0 });
                                       setLessonForm({...lessonForm, questions: qs});
                                    }} className="text-xs text-primary font-bold self-start mt-2 ml-4 hover:bg-primary/5 px-2 py-1 rounded transition-colors flex items-center gap-1"><Plus size={12}/> เพิ่มตัวเลือก</button>
                                  </div>
                                </div>
                              ))}
                              {lessonForm.questions?.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                                  ยังไม่มีคำถาม คลิก "+ เพิ่มข้อ" เพื่อเริ่มสร้างแบบทดสอบ
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button type="button" onClick={() => setShowLessonModal(false)} className="btn btn-outline flex-1 py-3">ยกเลิก</button>
                    <button type="submit" className="btn btn-primary flex-1 py-3 font-bold">บันทึกบทเรียน</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Management Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="card bg-white w-full max-w-md p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">จัดการหมวดหมู่</h3>
              <button onClick={() => setShowCatModal(false)} className="text-muted hover:text-gray-800">ปิด</button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex gap-2 mb-6">
              <input
                required
                type="text"
                placeholder="ชื่อหมวดหมู่ใหม่..."
                className="form-input flex-1"
                value={catForm.name}
                onChange={e => setCatForm({ ...catForm, name: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">
                {editingCatId ? 'บันทึก' : 'เพิ่ม'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto">
              <p className="text-xs font-bold text-muted mb-2 uppercase">รายการปัจจุบัน</p>
              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCatId(cat.id); setCatForm({ name: cat.name, order: cat.order }); }} className="text-primary p-1 hover:bg-white rounded transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCat(cat.id)} className="text-danger p-1 hover:bg-white rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-center text-sm text-muted py-4">ยังไม่มีหมวดหมู่</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="ค้นหาคอร์ส..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-md focus:outline-none focus:border-primary text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-sm">
            <select className="border border-border rounded-md px-3 py-2 bg-white text-muted focus:outline-none">
              <option value="ALL">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Table Desktop / Card List Mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-border text-sm text-muted">
                    <th className="p-4 font-medium">ชื่อคอร์ส</th>
                    <th className="p-4 font-medium">หมวดหมู่</th>
                    <th className="p-4 font-medium text-center">ผู้เรียน</th>
                    <th className="p-4 font-medium text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((course) => (
                    <tr key={course.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium">{course.title}</td>
                      <td className="p-4 text-sm text-muted">{course.category?.name || 'Uncategorized'}</td>
                      <td className="p-4 text-sm text-center">{course._count?.enrollments || 0}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditCourse(course)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(course.id)} className="p-1.5 text-danger hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination mock */}
            <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted">
              <span>แสดงจำนวนคอร์สทั้งหมด</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 bg-primary text-white rounded">1</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
