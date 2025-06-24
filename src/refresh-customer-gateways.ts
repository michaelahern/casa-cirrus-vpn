import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export class RefreshCustomerGateways extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new lambda.Function(this, 'RefreshCustomerGateways', {
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset(path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist/lambdas/refresh-customer-gateways')),
            handler: 'module.handler',
            timeout: cdk.Duration.minutes(1),
            functionName: 'RefreshCustomerGateways',
            memorySize: 192,
            tracing: lambda.Tracing.ACTIVE,
            architecture: lambda.Architecture.ARM_64
        });
    }
}
