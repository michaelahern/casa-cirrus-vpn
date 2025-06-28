import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as schedulerTargets from 'aws-cdk-lib/aws-scheduler-targets';
import { Construct } from 'constructs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export class RefreshCustomerGateways extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const src = path.dirname(fileURLToPath(import.meta.url));
        const func = new lambdaNodejs.NodejsFunction(this, 'Function', {
            // https://github.com/aws/aws-cdk/pull/21802#issuecomment-1249940400
            entry: path.join(src, 'refresh-customer-gateways.function.ts'),
            runtime: lambda.Runtime.NODEJS_22_X,
            bundling: {
                format: lambdaNodejs.OutputFormat.ESM
            },
            timeout: cdk.Duration.minutes(2),
            memorySize: 256,
            tracing: lambda.Tracing.ACTIVE,
            architecture: lambda.Architecture.ARM_64,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_333_0,
            layers: [
                // https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Application-Signals-Enable-LambdaMain.html#CloudWatch-Application-Signals-Lambda-CDK
                lambda.LayerVersion.fromLayerVersionArn(this, 'AwsLambdaLayerForOtel', `arn:aws:lambda:${props?.env?.region}:615299751070:layer:AWSOpenTelemetryDistroJs:8`)
            ],
            environment: {
                AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-instrument'
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

        func.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaApplicationSignalsExecutionRolePolicy'));

        new scheduler.Schedule(this, 'Schedule', {
            schedule: scheduler.ScheduleExpression.rate(cdk.Duration.hours(1)),
            target: new schedulerTargets.LambdaInvoke(func, {
                retryAttempts: 0
            })
        });
    }
}
