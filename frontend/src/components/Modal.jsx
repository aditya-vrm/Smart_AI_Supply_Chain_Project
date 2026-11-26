import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className={`relative transform overflow-hidden rounded-2xl bg-forest-900/95 backdrop-blur-2xl text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} border border-sand/20 p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Electric Purple Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple to-transparent"></div>

          <div className="flex items-center justify-between pb-4 border-b border-sand/15 mb-5">
            <h3 className="text-base font-bold text-sand-50 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple"></span>
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-sand/60 hover:text-sand-50 hover:bg-forest-850 transition-colors border border-transparent hover:border-sand/15"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
