const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { Match, Template } = require('aws-cdk-lib/assertions');

for (const stack of ['TeamBilling', 'TeamReporting']) {
  test(`${stack} enforces the shared storage controls`, () => {
    const template = Template.fromJSON(
      JSON.parse(readFileSync(`cdk.out/${stack}.template.json`, 'utf8'))
    );

    template.resourceCountIs('AWS::KMS::Key', 1);
    template.resourceCountIs('AWS::S3::Bucket', 1);

    const [keyId] = Object.keys(template.findResources('AWS::KMS::Key'));
    const [bucketId] = Object.keys(template.findResources('AWS::S3::Bucket'));

    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });

    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{
          BucketKeyEnabled: true,
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'aws:kms',
            KMSMasterKeyID: { 'Fn::GetAtt': [keyId, 'Arn'] },
          },
        }],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      VersioningConfiguration: { Status: 'Enabled' },
    });

    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      Bucket: { Ref: bucketId },
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Deny',
            Action: 's3:*',
            Principal: { AWS: '*' },
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      },
    });

    for (const id of [keyId, bucketId]) {
      assert.equal(template.toJSON().Resources[id].DeletionPolicy, 'Retain');
    }
  });
}
