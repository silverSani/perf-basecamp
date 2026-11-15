import { useRef } from 'react';
import useMousePosition from '../../hooks/useMousePosition';

import styles from './CustomCursor.module.css';

type CustomCursorProps = {
  text: string;
};

const CustomCursor = ({ text = '' }: CustomCursorProps) => {
  const [...cursorTextChars] = text;
  const cursorRef = useRef<HTMLDivElement>(null);

  // top/left 대신 transform으로 움직여 레이아웃 없이 합성(Composite) 단계만 다시 일어나게 합니다.
  useMousePosition(({ pageX, pageY }) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${pageX}px, ${pageY}px, 0)`;
    }
  });

  return (
    <div ref={cursorRef} className={styles.cursor}>
      {cursorTextChars.map((char, index) => (
        <span key={index} className={styles.character}>
          {char}
        </span>
      ))}
    </div>
  );
};

export default CustomCursor;
