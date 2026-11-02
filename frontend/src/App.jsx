import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Module Pages
import Dashboard from './pages/dashboard/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import DepartmentList from './pages/departments/DepartmentList';
import AttendanceList from './pages/attendance/AttendanceList';
import LeaveList from './pages/leave/LeaveList';
import PayrollList from './pages/payroll/PayrollList';
import PerformanceList from './pages/performance/PerformanceList';
import DocumentList from './pages/documents/DocumentList';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        
        {/* HR / Admin only */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'hr_manager']}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'hr_manager']}>
              <DepartmentList />
            </ProtectedRoute>
          }
        />

        {/* Available to all authenticated employees */}
        <Route path="/attendance" element={<AttendanceList />} />
        <Route path="/leaves" element={<LeaveList />} />
        <Route path="/payroll" element={<PayrollList />} />
        <Route path="/performance" element={<PerformanceList />} />
        <Route path="/documents" element={<DocumentList />} />
        
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'hr_manager']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

