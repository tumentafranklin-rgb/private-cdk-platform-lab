import { App, Stack } from 'aws-cdk-lib';
import { SecureBucket } from '../lib/secure-bucket';

const app = new App();

const billing = new Stack(app, 'TeamBilling');
new SecureBucket(billing, 'Default');

const reporting = new Stack(app, 'TeamReporting');
new SecureBucket(reporting, 'ReportingStorage');
