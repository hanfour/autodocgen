import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareDialog from './ShareDialog';

interface ShareButtonProps {
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  resourceName: string;
  currentUserId: string;
  onShareUpdate?: () => void;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

/**
 * ShareButton - Convenient wrapper component for opening ShareDialog
 *
 * Usage:
 * ```tsx
 * <ShareButton
 *   resourceType="project"
 *   resourceId={project.id}
 *   resourceName={project.project_name}
 *   currentUserId={currentUser.uid}
 *   onShareUpdate={() => refetchProject()}
 * />
 * ```
 */
const ShareButton: React.FC<ShareButtonProps> = ({
  resourceType,
  resourceId,
  resourceName,
  currentUserId,
  onShareUpdate,
  variant = 'secondary',
  className = '',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getButtonClass = () => {
    const baseClasses = 'flex items-center gap-2 transition-all';

    switch (variant) {
      case 'primary':
        return `${baseClasses} btn-primary ${className}`;
      case 'secondary':
        return `${baseClasses} btn-secondary ${className}`;
      case 'icon':
        return `${baseClasses} p-2 hover:bg-gray-100 rounded-lg ${className}`;
      default:
        return `${baseClasses} ${className}`;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className={getButtonClass()}
        title={`Share ${resourceType}`}
      >
        <Share2 className="w-4 h-4" />
        {variant !== 'icon' && <span>Share</span>}
      </button>

      <ShareDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        resourceType={resourceType}
        resourceId={resourceId}
        resourceName={resourceName}
        currentUserId={currentUserId}
        onShareUpdate={onShareUpdate}
      />
    </>
  );
};

export default ShareButton;
