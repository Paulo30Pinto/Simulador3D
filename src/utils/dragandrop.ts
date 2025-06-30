/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useCallback, useEffect } from "react";

type UseDraggableResult = {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
    onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
};
/*
interface UseDraggableResult {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}
*/

export function useDraggable(initialPosition = { x: 0, y: 0 }): UseDraggableResult {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    const rect = ref.current?.getBoundingClientRect();
    offset.current = {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
    document.body.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    document.body.style.userSelect = "";
  }, []);

  // Touch events for mobile
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setDragging(true);
    const rect = ref.current?.getBoundingClientRect();
    const touch = e.touches[0];
    offset.current = {
      x: touch.clientX - (rect?.left ?? 0),
      y: touch.clientY - (rect?.top ?? 0),
    };
    document.body.style.userSelect = "none";
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - offset.current.x,
      y: touch.clientY - offset.current.y,
    });
  }, [dragging]);

  const onTouchEnd = useCallback(() => {
    setDragging(false);
    document.body.style.userSelect = "";
  }, []);

  // Attach/detach listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  return {
    ref,
    style: {
      position: "absolute",
      left: position.x,
      top: position.y,
      cursor: dragging ? "grabbing" : "grab",
      touchAction: "none",
      zIndex: 1000,
    },
    // handlers to be spread on the draggable element
    onMouseDown,
    onTouchStart,
  } as any;
}