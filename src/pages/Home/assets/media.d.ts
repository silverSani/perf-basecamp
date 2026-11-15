// webpack이 파일로 내보내는 이미지·동영상을 TypeScript에서 import할 수 있게 선언합니다.
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.mp4' {
  const src: string;
  export default src;
}
