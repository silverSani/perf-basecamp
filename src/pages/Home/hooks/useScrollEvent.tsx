import { useEffect, useRef } from 'react';

type ScrollHandler = () => void;

/**
 * 스크롤 시 핸들러를 호출합니다.
 * - 리스너는 마운트 시 한 번만 등록합니다(최신 핸들러는 ref로 참조).
 * - requestAnimationFrame으로 묶어 한 프레임에 최대 한 번만 실행합니다.
 * - passive 리스너라 브라우저가 스크롤을 막지 않고 바로 처리할 수 있습니다.
 */
const useScrollEvent = (onScroll: ScrollHandler) => {
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  useEffect(() => {
    let frameId: number | null = null;

    const handleScroll = () => {
      if (frameId !== null) return;

      frameId = requestAnimationFrame(() => {
        frameId = null;
        onScrollRef.current();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    onScrollRef.current(); // 첫 진입 시 현재 스크롤 위치 기준으로 한 번 그려줍니다.

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);
};

export default useScrollEvent;
