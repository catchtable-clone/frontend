import { useCallback, useEffect, useState } from 'react';

export function useDragScroll<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    const el = node;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let hasMoved = false;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      hasMoved = false;
      startX = e.pageX;
      scrollLeftStart = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };

    const stopDrag = () => {
      isDown = false;
      el.style.cursor = 'grab';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX;
      const walk = x - startX;
      if (Math.abs(walk) > 5) hasMoved = true;
      if (hasMoved) {
        e.preventDefault();
        el.scrollLeft = scrollLeftStart - walk;
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', stopDrag);
    el.addEventListener('mouseup', stopDrag);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', stopDrag);
      el.removeEventListener('mouseup', stopDrag);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [node]);

  return ref;
}
