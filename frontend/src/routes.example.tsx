/**
 * Routes Configuration Example
 *
 * This is an example of how to configure routes for the application.
 * Rename this file to routes.tsx and import it in your App.tsx
 *
 * Usage:
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import { routes } from './routes';
 *
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Routes>
 *         {routes.map(route => (
 *           <Route key={route.path} {...route} />
 *         ))}
 *       </Routes>
 *     </BrowserRouter>
 *   );
 * }
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';

// Import Pages
import {
  ProjectList,
  CreateProject,
  ProjectDetail,
  EditProject,
} from './pages/Projects';

// Define route configuration
export const routes: RouteObject[] = [
  // Root redirect
  {
    path: '/',
    element: <div>Dashboard or Home Page</div>, // Replace with actual Dashboard
  },

  // Projects Routes
  {
    path: '/projects',
    children: [
      {
        index: true,
        element: <ProjectList />,
      },
      {
        path: 'new',
        element: <CreateProject />,
      },
      {
        path: ':projectId',
        element: <ProjectDetail />,
      },
      {
        path: ':projectId/edit',
        element: <EditProject />,
      },
    ],
  },

  // Templates Routes (to be implemented)
  {
    path: '/templates',
    element: <div>Templates Page (To be implemented)</div>,
  },

  // Companies Routes (to be implemented)
  {
    path: '/companies',
    element: <div>Companies Page (To be implemented)</div>,
  },

  // Contacts Routes (to be implemented)
  {
    path: '/contacts',
    element: <div>Contacts Page (To be implemented)</div>,
  },

  // Auth Routes (to be implemented)
  {
    path: '/login',
    element: <div>Login Page (To be implemented)</div>,
  },
  {
    path: '/register',
    element: <div>Register Page (To be implemented)</div>,
  },

  // 404 Not Found
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  },
];

/**
 * Alternative: Flat Route Configuration for simple use
 */
export const flatRoutes = {
  // Projects
  '/projects': ProjectList,
  '/projects/new': CreateProject,
  '/projects/:projectId': ProjectDetail,
  '/projects/:projectId/edit': EditProject,

  // Add more routes as you implement them
};
