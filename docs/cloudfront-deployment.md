# CloudFront 배포

이 설정은 정적 파일을 비공개 S3 버킷에 저장하고 CloudFront만 읽을 수 있게 합니다. 배포 경로는 `/perf-basecamp/`이며, CloudFront Function이 `/perf-basecamp/search` 같은 확장자 없는 경로를 SPA 진입 HTML로 보냅니다.

## 스택 배포

S3 버킷 이름은 전 세계에서 고유해야 합니다. 이름을 정한 뒤 AWS 리전을 지정해 CloudFormation 스택을 생성합니다.

```sh
aws cloudformation deploy \
  --template-file infra/cloudfront.yml \
  --stack-name perf-basecamp-cloudfront \
  --parameter-overrides SiteBucketName=<전역에서_고유한_버킷_이름>
```

스택 출력에서 버킷 이름, CloudFront 배포 ID, 사이트 URL을 확인합니다. 배포가 `Deployed` 상태가 된 뒤 사이트를 확인합니다.

## 파일 캐시 정책

`scripts/deploy-cloudfront.sh`는 파일명에 content hash가 있는 빌드 산출물을 S3에 `public,max-age=31536000,immutable`로 올립니다. `index.html`은 `no-cache,max-age=0,must-revalidate`를 지정해 재방문 시 새 파일명을 반영하도록 합니다. CloudFront Cache Policy는 최소 TTL과 기본 TTL을 0으로 두어 S3의 `Cache-Control` 메타데이터를 따르고, Brotli/Gzip 응답을 압축 및 캐시 키에 반영합니다.

배포할 때 다음 환경 변수를 지정합니다.

```sh
S3_BUCKET=<스택_출력_버킷_이름> \
CLOUDFRONT_DISTRIBUTION_ID=<스택_출력_배포_ID> \
./scripts/deploy-cloudfront.sh
```

## 확인

- CloudFront URL의 `/perf-basecamp/` 및 `/perf-basecamp/search`를 연다.
- Chrome DevTools Network에서 HTML은 재검증되고 해시 JS·이미지는 `br` 또는 `gzip` 압축 응답과 캐시를 사용하는지 확인한다.
- 다시 방문했을 때 정적 자산이 캐시에서 제공되고, Search 재진입 시 Trending 요청이 반복되지 않는지 확인한다.
- WebPageTest에서 Paris / EC2 Chrome / CPU 6x / Fast 3G 설정으로 첫 방문과 재방문 LCP를 기록한다.
