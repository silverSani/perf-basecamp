#!/usr/bin/env bash
set -euo pipefail

: "${S3_BUCKET:?Set S3_BUCKET to the site bucket name}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?Set CLOUDFRONT_DISTRIBUTION_ID to the distribution ID}"

npm run build:prod

# Content-hashed assets can be cached for a year. HTML is always revalidated so
# a new deploy can point browsers to the latest hashed asset names.
aws s3 sync dist/ "s3://${S3_BUCKET}/perf-basecamp/" \
  --delete \
  --cache-control 'public,max-age=31536000,immutable' \
  --exclude 'index.html'
aws s3 cp dist/index.html "s3://${S3_BUCKET}/perf-basecamp/index.html" \
  --cache-control 'no-cache,max-age=0,must-revalidate' \
  --content-type 'text/html; charset=utf-8'

aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths '/perf-basecamp/index.html'
