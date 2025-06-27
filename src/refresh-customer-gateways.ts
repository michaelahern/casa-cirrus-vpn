import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as schedulerTargets from 'aws-cdk-lib/aws-scheduler-targets';
import { Construct } from 'constructs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export class RefreshCustomerGateways extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const func = new lambda_nodejs.NodejsFunction(this, 'Function', {
            // https://github.com/aws/aws-cdk/pull/21802#issuecomment-1249940400
            entry: path.join(path.dirname(fileURLToPath(import.meta.url)), 'refresh-customer-gateways.function.ts'),
            runtime: lambda.Runtime.NODEJS_22_X,
            timeout: cdk.Duration.minutes(2),
            memorySize: 192,
            tracing: lambda.Tracing.ACTIVE,
            architecture: lambda.Architecture.ARM_64,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_333_0,
            adotInstrumentation: {
                layerVersion: lambda.AdotLayerVersion.fromJavaScriptSdkLayerVersion(lambda.AdotLambdaLayerJavaScriptSdkVersion.LATEST),
                execWrapper: lambda.AdotLambdaExecWrapper.REGULAR_HANDLER
            },
            bundling: {
                format: lambda_nodejs.OutputFormat.ESM
            }
        });

        func.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
            actions: [
                'ec2:CreateCustomerGateway',
                'ec2:DescribeCustomerGateways',
                'ec2:DescribeVpnConnections',
                'ec2:ModifyVpnConnection'
            ],
            resources: ['*']
        }));

        new scheduler.Schedule(this, 'Schedule', {
            schedule: scheduler.ScheduleExpression.rate(cdk.Duration.hours(1)),
            target: new schedulerTargets.LambdaInvoke(func)
        });
    }
}
