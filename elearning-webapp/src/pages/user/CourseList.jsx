import { Search, Filter, X, ChevronDown, Grid } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import { filterCourses, sortCourses } from '../../utils/courseFilters';
import CategorySearchModal from '../../components/common/CategorySearchModal';
import CourseCard from '../../components/common/CourseCard';

const CourseList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter & Search State
  const [activeCat, setActiveCat] = useState(urlCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'a-z'
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  useEffect(() => {
    if (urlCategory) {
      setActiveCat(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories()
        ]);
        setCourses(coursesRes.data);
        setCategories([{ id: 'ALL', name: 'All' }, ...catRes.data]);
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Filtered and Sorted Array
  const filtered = sortCourses(
    filterCourses(courses, { activeCat, searchQuery }),
    sortBy
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full pt-2 relative pb-32">
      <div className="sticky top-[-1px] z-40 bg-[#f8fafc]/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 space-y-4 shadow-sm sm:shadow-none border-b border-gray-100 sm:border-none mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">คอร์สเรียนทั้งหมด</h2>
        <button 
          onClick={() => setShowFilterModal(true)}
          className="text-gray-500 hover:text-primary transition-colors bg-white p-2.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-2 group relative"
        >
          <Filter size={18} className="group-hover:text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">ตัวกรอง</span>
          
          {/* Active Filter Dot */}
          {(activeCat !== 'All' || sortBy !== 'newest') && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="ค้นหาชื่อคอร์ส หรือคำอธิบาย..." 
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all text-[15px] font-medium placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 items-center">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCat(cat.name)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all min-w-[100px] ${
              activeCat === cat.name 
                ? 'bg-primary text-white shadow-md shadow-primary/30' 
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {/* View All Button at the far right */}
        <button 
          onClick={() => setIsCatModalOpen(true)}
          className="shrink-0 px-6 py-2.5 bg-primary/5 text-primary border border-primary/20 rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all shadow-sm whitespace-nowrap flex items-center gap-2 ml-2"
        >
          <Grid size={14} /> ดูทั้งหมด
        </button>
      </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Course List Grid (SkillLane Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4 mb-10 relative z-10">
        {!loading && filtered.length > 0 ? (
          filtered.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              className="w-full h-full"
            />
          ))
        ) : !loading && (
          <div className="col-span-full text-center py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm w-full">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Search size={32} className="text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-gray-600 text-lg mb-1">ไม่พบคอร์สที่ค้นหา</h3>
            <p className="text-sm text-gray-400">ลองเปลี่ยนคำค้นหา หรือใช้ตัวกรองหมวดหมู่อื่นดูสิ</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCat('All'); setSortBy('newest'); }}
              className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal Overlay */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/30 backdrop-blur-sm animate-fade-in">
           {/* Click away area */}
           <div className="absolute inset-0" onClick={() => setShowFilterModal(false)}></div>
           
           {/* Slide Panel */}
           <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-slide-in-right transform">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Filter size={20} className="text-primary"/> ตัวกรองขั้นสูง
                 </h3>
                 <button onClick={() => setShowFilterModal(false)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                 {/* Sort Section */}
                 <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">การจัดเรียง (Sort By)</h4>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">เพิ่มล่าสุด (Newest)</span>
                      <input type="radio" name="sort" checked={sortBy === 'newest'} onChange={() => setSortBy('newest')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">เก่าที่สุด (Oldest)</span>
                      <input type="radio" name="sort" checked={sortBy === 'oldest'} onChange={() => setSortBy('oldest')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">เรียงตามพยัญชนะ (A-Z)</span>
                      <input type="radio" name="sort" checked={sortBy === 'a-z'} onChange={() => setSortBy('a-z')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">คะแนนสูงสุด (Max Points)</span>
                      <input type="radio" name="sort" checked={sortBy === 'points_desc'} onChange={() => setSortBy('points_desc')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                 </div>

                 {/* Category Section in Modal */}
                 <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">หมวดหมู่ (Category)</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setActiveCat(cat.name)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            activeCat === cat.name 
                              ? 'bg-primary/10 text-primary border-primary/30' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                 <button 
                   onClick={() => { setActiveCat('All'); setSortBy('newest'); }}
                   className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                 >
                   ล้างค่า
                 </button>
                 <button 
                   onClick={() => setShowFilterModal(false)}
                   className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:bg-primary-hover transition-all"
                 >
                   ดูผลลัพธ์
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Categories Search Modal */}
      <CategorySearchModal 
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories.filter(c => c.id !== 'ALL')} // Exclude "All" special category
        courses={courses}
        onSelect={(catName) => {
            setActiveCat(catName);
        }}
      />
    </div>
  );
};

export default CourseList;
