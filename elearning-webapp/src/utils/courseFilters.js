/**
 * Utility for filtering and sorting courses consistently across the app.
 */
export const filterCourses = (courses, { activeCat = 'All', searchQuery = '' }) => {
  if (!courses) return [];
  
  return courses.filter(c => {
    const matchCat = activeCat === 'All' || c.category?.name === activeCat;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(searchLower) || 
                      (c.description && c.description.toLowerCase().includes(searchLower));
    return matchCat && matchSearch;
  });
};

export const sortCourses = (courses, sortBy = 'newest') => {
  if (!courses) return [];
  const sorted = [...courses]; // Avoid mutating original array
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'a-z':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'points_desc':
      return sorted.sort((a, b) => (b.points || 0) - (a.points || 0));
    default:
      return sorted;
  }
};
