import * as cdk from 'aws-cdk-lib';
import { RefreshCustomerGateways } from './refresh-customer-gateways.js';

const app = new cdk.App();

new RefreshCustomerGateways(app, 'RefreshCustomerGateways', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
