import { memo } from 'react';
import { GifImageModel } from '../../../../models/image/gifImage';

import styles from './GifItem.module.css';

type GifItemProps = Omit<GifImageModel, 'id'>;

const GifItem = ({ imageUrl = '', title = '' }: GifItemProps) => {
  return (
    <div className={styles.gifItem}>
      <img className={styles.gifImage} src={imageUrl} alt={title} loading="lazy" decoding="async" />
      <div className={styles.gifTitleContainer}>
        <div className={styles.gifTitleBg}></div>
        <h4 className={styles.gifTitle}>{title}</h4>
      </div>
    </div>
  );
};

// props(imageUrl, title)가 같으면 다시 렌더하지 않습니다.
// → "load more" 시 기존 아이템은 그대로 두고 새로 추가된 아이템만 렌더됩니다.
export default memo(GifItem);
