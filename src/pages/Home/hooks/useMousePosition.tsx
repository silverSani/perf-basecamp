import { useEffect, useRef } from 'react';

export type MousePosition = Pick<MouseEvent, 'clientX' | 'clientY' | 'pageX' | 'pageY'>;

/**
 * 마우스 위치가 바뀔 때 콜백을 호출합니다.
 * - state를 쓰지 않으므로 마우스가 움직여도 React 리렌더가 일어나지 않습니다.
 * - requestAnimationFrame으로 묶어 한 프레임에 최대 한 번만 콜백을 실행합니다.
 */
const useMousePosition = (onMove: (position: MousePosition) => void) => {
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    let frameId: number | null = null;
    let latest: MousePosition | null = null;

    const updateMousePosition = (e: MouseEvent) => {
      latest = { clientX: e.clientX, clientY: e.clientY, pageX: e.pageX, pageY: e.pageY };
      if (frameId !== null) return;

      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (latest !== null) onMoveRef.current(latest);
      });
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);
};

export default useMousePosition;
