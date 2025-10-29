/**
 * Main Application Component - Example
 *
 * This is an example of how to set up the main App component with routing.
 * Rename this file to App.tsx to use it.
 *
 * Features:
 * - React Router v6 integration
 * - Firebase authentication state
 * - Layout with navigation
 * - Protected routes (optional)
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Auth Components (needed immediately)
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Profile = lazy(() => import('./pages/Auth/Profile'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));

const ProjectList = lazy(() => import('./pages/Projects/ProjectList'));
const CreateProject = lazy(() => import('./pages/Projects/CreateProject'));
const ProjectDetail = lazy(() => import('./pages/Projects/ProjectDetail'));
const EditProject = lazy(() => import('./pages/Projects/EditProject'));

const CompanyList = lazy(() => import('./pages/Companies/CompanyList'));
const CompanyForm = lazy(() => import('./pages/Companies/CompanyForm'));

const ContactList = lazy(() => import('./pages/Contacts/ContactList'));
const ContactForm = lazy(() => import('./pages/Contacts/ContactForm'));

const MainLayout = lazy(() => import('./components/Layout/MainLayout'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">載入中...</p>
    </div>
  </div>
);

// Import Auth Hook (to be implemented)
// import { useAuth } from './hooks/useAuth';

/**
 * Protected Route Wrapper (optional)
 * Uncomment when authentication is implemented
 */
// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }
//
// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { user, loading } = useAuth();
//
//   if (loading) {
//     return <div>Loading...</div>;
//   }
//
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//
//   return <>{children}</>;
// };

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Auth Routes (no layout, public) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Root - Redirect to projects */}
          <Route path="/" element={<Navigate to="/projects" replace />} />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Projects Routes */}
            <Route path="/projects">
              <Route index element={<ProjectList />} />
              <Route path="new" element={<CreateProject />} />
              <Route path=":projectId" element={<ProjectDetail />} />
              <Route path=":projectId/edit" element={<EditProject />} />
            </Route>

            {/* Companies Routes */}
            <Route path="/companies">
              <Route index element={<CompanyList />} />
              <Route path="new" element={<CompanyForm />} />
              <Route path=":companyId/edit" element={<CompanyForm />} />
            </Route>

            {/* Contacts Routes */}
            <Route path="/contacts">
              <Route index element={<ContactList />} />
              <Route path="new" element={<ContactForm />} />
              <Route path=":contactId/edit" element={<ContactForm />} />
            </Route>

            {/* Templates Routes (placeholder) */}
            <Route
              path="/templates"
              element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">模板管理</h1>
                  <p className="text-gray-600">功能开发中...</p>
                </div>
              }
            />

            {/* Profile Route */}
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <a href="/projects" className="btn-primary">
                    Go to Projects
                  </a>
                </div>
              </div>
            }
          />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

/**
 * Alternative: With Layout
 *
 * Uncomment this version when you have Layout components ready
 */

// const AppWithLayout: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Auth Routes (no layout) */}
//         <Route element={<AuthLayout />}>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//         </Route>
//
//         {/* Protected Routes (with main layout) */}
//         <Route element={<MainLayout />}>
//           <Route path="/" element={<Navigate to="/projects" replace />} />
//
//           <Route path="/projects">
//             <Route index element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
//             <Route path="new" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
//             <Route path=":projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
//             <Route path=":projectId/edit" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
//           </Route>
//
//           <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
//           <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
//           <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
//         </Route>
//
//         {/* 404 */}
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };
