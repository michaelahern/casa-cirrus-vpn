import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class RefreshCustomerGateways extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const myFunc = new lambda_nodejs.NodejsFunction(this, 'function', {
            // https://github.com/aws/aws-cdk/pull/21802#issuecomment-1249940400
            entry: new URL(import.meta.url.replace(/(.*)(\..+)/, '$1.' + 'function' + '$2')).pathname,
            runtime: lambda.Runtime.NODEJS_22_X,
            timeout: cdk.Duration.minutes(2),
            functionName: 'RefreshCustomerGateways',
            memorySize: 192,
            tracing: lambda.Tracing.ACTIVE,
            architecture: lambda.Architecture.ARM_64,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_333_0,
            bundling: {
                sourceMap: true,
                target: 'es2022',
                format: lambda_nodejs.OutputFormat.ESM
            }
        });

        myFunc.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
            actions: [
                'ec2:CreateCustomerGateway',
                'ec2:DescribeCustomerGateways',
                'ec2:DescribeVpnConnections',
                'ec2:ModifyVpnConnection'
            ],
            resources: ['*']
        }));
    }
}
