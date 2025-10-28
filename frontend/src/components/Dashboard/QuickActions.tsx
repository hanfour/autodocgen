import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload, FileText, Users, Building } from 'lucide-react';

/**
 * QuickActions - Dashboard quick action buttons
 *
 * Provides convenient shortcuts to common actions:
 * - Create new project
 * - Upload template
 * - View projects
 * - View companies
 * - View contacts
 */
const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Plus,
      label: 'New Project',
      description: 'Create a new project',
      href: '/projects/new',
      color: 'primary',
    },
    {
      icon: Upload,
      label: 'Upload Template',
      description: 'Upload a new template',
      href: '/templates/upload',
      color: 'info',
    },
    {
      icon: FileText,
      label: 'View Projects',
      description: 'Browse all projects',
      href: '/projects',
      color: 'gray',
    },
    {
      icon: Building,
      label: 'View Companies',
      description: 'Browse all companies',
      href: '/companies',
      color: 'gray',
    },
    {
      icon: Users,
      label: 'View Contacts',
      description: 'Browse all contacts',
      href: '/contacts',
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      primary: {
        bg: 'bg-primary-50',
        hover: 'hover:bg-primary-100',
        icon: 'text-primary-600',
      },
      info: {
        bg: 'bg-info-50',
        hover: 'hover:bg-info-100',
        icon: 'text-info-600',
      },
      gray: {
        bg: 'bg-gray-50',
        hover: 'hover:bg-gray-100',
        icon: 'text-gray-600',
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-600 mt-1">Shortcuts to common tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const colors = getColorClasses(action.color);

          return (
            <Link
              key={action.href}
              to={action.href}
              className={`
                ${colors.bg} ${colors.hover}
                rounded-lg p-4
                transition-all duration-200
                flex flex-col items-center text-center
                group
                hover:shadow-md
              `}
            >
              <div
                className={`
                  ${colors.icon}
                  w-12 h-12 rounded-full
                  flex items-center justify-center
                  mb-3
                  group-hover:scale-110
                  transition-transform duration-200
                `}
              >
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="font-medium text-gray-900 mb-1">{action.label}</h3>

              <p className="text-xs text-gray-500">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
