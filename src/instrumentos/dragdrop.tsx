import React from 'react';
import { useDragAndDrop } from '../utils/dragdrop';

interface DraggableImageProps {
  src: string;
  alt: string;
  className?: string;
  id?: string;
  initialPosition?: { x: number; y: number };
  style?: React.CSSProperties;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const DraggableImage: React.FC<DraggableImageProps> = ({
  src,
  alt,
  className = '',
  id,
  initialPosition = { x: 0, y: 0 },
  style = {},
  onPositionChange
}) => {
  const { dragRef, position, isDragging, handleMouseDown } = useDragAndDrop(initialPosition);

  // Callback para notificar mudanças de posição
  React.useEffect(() => {
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [position, onPositionChange]);

  const dragStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isDragging ? 1000 : 1,
    transition: isDragging ? 'none' : 'all 0.2s ease',
    ...style
  };

  return (
    <img
      ref={dragRef}
      src={src}
      alt={alt}
      className={`${className} ${isDragging ? 'dragging' : ''}`}
      id={id}
      style={dragStyle}
      onMouseDown={handleMouseDown}
      draggable={false} // Desabilita o drag nativo do browser
    />
  );
};
