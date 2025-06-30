import { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  position: Position;
  dragOffset: Position;
}

export const useDragAndDrop = (initialPosition: Position = { x: 0, y: 0 }) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    position: initialPosition,
    dragOffset: { x: 0, y: 0 }
  });

  const dragRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;

    const rect = dragRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragState(prev => ({
      ...prev,
      isDragging: true,
      dragOffset: { x: offsetX, y: offsetY }
    }));

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;

    const newX = e.clientX - dragState.dragOffset.x;
    const newY = e.clientY - dragState.dragOffset.y;

    setDragState(prev => ({
      ...prev,
      position: { x: newX, y: newY }
    }));
  }, [dragState.isDragging, dragState.dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false
    }));
  }, []);

  // Adicionar e remover event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    dragRef,
    position: dragState.position,
    isDragging: dragState.isDragging,
    handleMouseDown,
    setPosition: (newPosition: Position) => {
      setDragState(prev => ({
        ...prev,
        position: newPosition
      }));
    }
  };
};
