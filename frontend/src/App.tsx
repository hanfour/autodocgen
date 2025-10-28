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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import {
  ProjectList,
  CreateProject,
  ProjectDetail,
  EditProject,
} from './pages/Projects';

import {
  CompanyList,
  CompanyForm,
} from './pages/Companies';

import {
  ContactList,
  ContactForm,
} from './pages/Contacts';

// Import Layout Components
import { MainLayout } from './components/Layout';

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
      <Routes>
        {/* Root - Redirect to projects */}
        <Route path="/" element={<Navigate to="/projects" replace />} />

        {/* Main App with Layout */}
        <Route element={<MainLayout />}>
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
        </Route>

        {/* Auth Routes (no layout) */}
        <Route
          path="/login"
          element={<div className="p-6">Login Page - To be implemented</div>}
        />
        <Route
          path="/register"
          element={<div className="p-6">Register Page - To be implemented</div>}
        />

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
