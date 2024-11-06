import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

interface VizModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const VizModal = ({ isOpen, onClose, imageUrl }: VizModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999 
      }}
      onClick={onClose}
    >
      <div 
        className="h-screen w-full flex items-center justify-center"
      >
        <div 
          className="relative w-[75%] h-[75%] rounded-2xl shadow-2xl
            transform transition-all duration-300 animate-scale-in flex items-center justify-center
            bg-white"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80
              text-gray-500 hover:text-gray-700 transition-all duration-200 z-10"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <img 
            src={imageUrl} 
            alt="Visualization" 
            className="max-w-[95%] max-h-[95%] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};