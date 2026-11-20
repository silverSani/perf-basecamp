import { useRef } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';

import heroImage from './assets/hero.webp';
import heroImageSmall from './assets/hero-800.webp';
import trendingVideo from './assets/trending.mp4';
import findVideo from './assets/find.mp4';
import freeVideo from './assets/free.mp4';

import FeatureItem from './components/FeatureItem/FeatureItem';
import CustomCursor from './components/CustomCursor/CustomCursor';
import AnimatedPath from './components/AnimatedPath/AnimatedPath';

import styles from './Home.module.css';

const cx = classNames.bind(styles);

const Home = () => {
  const wrapperRef = useRef<HTMLElement>(null);

  return (
    <>
      <section className={styles.heroSection}>
        <img
          className={styles.heroImage}
          src={heroImage}
          // 화면 너비에 맞는 크기를 브라우저가 고르게 해서, 모바일에서는 800px(42KB)만 받습니다.
          srcSet={`${heroImageSmall} 800w, ${heroImage} 1600w`}
          sizes="100vw"
          alt="hero image"
          width={1600}
          height={1067}
          // React 18은 fetchPriority prop을 DOM에 전달하지 않아 소문자 속성으로 직접 넘깁니다.
          {...{ fetchpriority: 'high' }}
        />
        <div className={styles.projectTitle}>
          <h1 className={styles.title}>Memegle</h1>
          <h3 className={styles.subtitle}>gif search engine for you</h3>
        </div>
        <Link to="/search">
          <button className={cx('cta', 'linkButton')}>start search</button>
        </Link>
      </section>
      <section ref={wrapperRef} className={styles.featureSection}>
        <AnimatedPath wrapperRef={wrapperRef} />
        <div className={styles.featureSectionWrapper}>
          <h2 className={styles.featureTitle}>Features</h2>
          <div className={styles.featureItemContainer}>
            <FeatureItem title="See trending gif" videoSrc={trendingVideo} />
            <FeatureItem title="Find gif for free" videoSrc={findVideo} />
            <FeatureItem title="Free for everyone" videoSrc={freeVideo} />
          </div>
          <Link to="/search">
            <button className={styles.linkButton}>start search</button>
          </Link>
        </div>
      </section>
      <CustomCursor text="memegle" />
    </>
  );
};

export default Home;
