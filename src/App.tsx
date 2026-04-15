import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import ForgotPasswordEmail from './auth/Forgotpassword-email';
import ForgotPasswordOTP from './auth/Forgotpassword-otp';
import ForgotPasswordNewPassword from './auth/Forgotpassword-newpassword';
import ForgotPasswordSuccess from './auth/Forgotpassword-success';
import { CssBaseline, GlobalStyles } from '@mui/material';
import AdminLayout from './layout/layout/AdminLayout';
import Organization from './page/Organization';
import Users from './page/Users';
import Roles from './page/Roles';
import Billing from './page/Billing';
import EmailTemplates from './page/EmailTemplates';
import AuditLog from './page/AuditLog';
import Profile from './page/Profile';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#F9FAFB',
          },
          '#root': {
            minHeight: '100vh',
            width: '100vw',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
        <Route path="/forgot-password/otp" element={<ForgotPasswordOTP />} />
        <Route path="/forgot-password/new-password" element={<ForgotPasswordNewPassword />} />
        <Route path="/forgot-password/success" element={<ForgotPasswordSuccess />} />

        {/* Admin Dashboard Layout */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/admin/organization" replace />} />
          <Route path="organization" element={<Organization />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="billing" element={<Billing />} />
          <Route path="email-templates" element={<EmailTemplates />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
