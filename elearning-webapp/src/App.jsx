import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Layouts
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';

// User Pages
import Home from './pages/user/Home';
import CourseList from './pages/user/CourseList';
import CompletedCourses from './pages/user/CompletedCourses';
import CourseDetail from './pages/user/CourseDetail';
import LessonPlayer from './pages/user/LessonPlayer';
import Rewards from './pages/user/Rewards';
import PointsHistory from './pages/user/PointsHistory';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCourses from './pages/admin/CourseManagement';
import AdminUsers from './pages/admin/UserManagement';
import AdminRewards from './pages/admin/RewardsManagement';
import AdminRedeems from './pages/admin/RedeemRequests';
import AdminReports from './pages/admin/Reports';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
      {/* Root Redirect - Check for existing session */}
      <Route path="/" element={
        localStorage.getItem('token') ? (
          JSON.parse(localStorage.getItem('user'))?.role === 'admin' 
            ? <Navigate to="/admin/dashboard" replace /> 
            : <Navigate to="/user/home" replace />
        ) : <Navigate to="/login" replace />
      } />
      
      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* User Area */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="completed" element={<CompletedCourses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="courses/:id/lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="points-history" element={<PointsHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Area */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="redeems" element={<AdminRedeems />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div className="p-6 text-center">404 - Page Not Found</div>} />
      </Routes>
      <SpeedInsights />
    </>
  );
}

export default App;
