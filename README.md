# Private CDK Platform Lab

A TypeScript CDK construct gives Billing and Reporting KMS-encrypted,
versioned S3 buckets with public access blocked and HTTPS enforced.

## Verify locally

Use Node.js 22. Run `npm ci` and `npm test` from the repository root.
The tests synthesize and inspect both CloudFormation templates.

## CI regression demo

Draft PR #1 disabled HTTPS enforcement. Both template tests failed
because the bucket policy was missing. Reverting the change restored
both tests. The draft was closed without merging.

- Failed run: 45835371743
- Successful revert run: 45835691914

## Independent upgrade review

Both consumers installed the local 1.0.0 package and reproduced their
original templates. Reporting then installed 1.1.0 and enabled EventBridge.
Billing stayed on 1.0.0 and produced an identical template after npm ci.

Reporting's bucket, KMS key, and bucket policy definitions stayed identical.
CDK added a notification custom resource, Lambda function, IAM role, and
IAM policy. The inline policy allows s3:PutBucketNotification on Reporting's
bucket ARN. The role trusts Lambda and attaches AWSLambdaBasicExecutionRole.

Validation scope: local synthesis and GitHub Actions. No AWS resources
were deployed. A sandbox deployment would verify event delivery.
