import styles from './FeatureItem.module.css';

type FeatureItemProps = {
  title: string;
  videoSrc: string;
};

const FeatureItem = ({ title, videoSrc }: FeatureItemProps) => {
  return (
    <div className={styles.featureItem}>
      {/* GIF 대신 동영상: 같은 애니메이션을 1/15 수준의 용량으로 재생합니다. */}
      <video
        className={styles.featureImage}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className={styles.featureTitleBg}></div>
      <h3 className={styles.featureTitle}>{title}</h3>
    </div>
  );
};

export default FeatureItem;
