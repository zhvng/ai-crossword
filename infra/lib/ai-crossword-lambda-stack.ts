import { Duration, Stack, StackProps, CfnOutput, Aws } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { GraphWidget, Dashboard, LogQueryWidget, TextWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { Function, Runtime, AssetCode } from "aws-cdk-lib/aws-lambda";
import { ARecord, HostedZone, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from 'constructs';

interface AiCrosswordLambdaStackProps extends StackProps {
  dashboardName: string
  domainName: string
  openaiApiKey: string
}

export class AiCrosswordLambdaStack extends Stack {
  private lambdaFunction: Function
  public restApi: LambdaRestApi
  public hostedZone: IHostedZone
  public certificate: DnsValidatedCertificate
  private dashboard: Dashboard

  constructor(scope: Construct, id: string, props: AiCrosswordLambdaStackProps) {
    super(scope, id, props);

    const domainName = props.domainName;
    this.hostedZone = HostedZone.fromLookup(this, 'AiCrosswordHostedZone', {
      domainName,
    });
    this.certificate = new DnsValidatedCertificate(this, 'AiCrosswordCert', {
      domainName,
      hostedZone: this.hostedZone,
      region: 'us-east-1',
      subjectAlternativeNames: [`*.${domainName}`],
    });

    this.lambdaFunction = new Function(this, "AiCrosswordLambda", {
      handler: "dist/src/lambda.handler",
      runtime: Runtime.NODEJS_14_X,
      // entry: path.join(__dirname, `/../../server/src/lambda.ts`),
      code: new AssetCode('../server'),
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: {
        STAGE: 'prod',
        OPENAI_API_KEY: props.openaiApiKey,
      }
    });

    this.restApi = new LambdaRestApi(this, 'AiCrosswordLambdaRestApi', {
      restApiName: 'AiCrosswordApi',
      handler: this.lambdaFunction,
      proxy: true,
      domainName: {
        domainName: `api.${domainName}`,
        certificate: this.certificate
      }
    });

    new ARecord(this, "apiDNS", {
      zone: this.hostedZone,
      recordName: "api",
      target: RecordTarget.fromAlias(
        new ApiGateway(this.restApi)
      ),
    });

    // Create CloudWatch Dashboard
    this.dashboard = new Dashboard(this, "AiCrosswordLambdaDashboard", {
      dashboardName: props.dashboardName
    })

    // Create Title for Dashboard
    this.dashboard.addWidgets(new TextWidget({
      markdown: `# Dashboard: ${this.lambdaFunction.functionName}`,
      height: 1,
      width: 24
    }))

    // Create CloudWatch Dashboard Widgets: Errors, Invocations, Duration, Throttles
    this.dashboard.addWidgets(new GraphWidget({
      title: "Invocations",
      left: [this.lambdaFunction.metricInvocations()],
      width: 24
    }))

    this.dashboard.addWidgets(new GraphWidget({
      title: "Errors",
      left: [this.lambdaFunction.metricErrors()],
      width: 24
    }))

    this.dashboard.addWidgets(new GraphWidget({
      title: "Duration",
      left: [this.lambdaFunction.metricDuration()],
      width: 24
    }))

    this.dashboard.addWidgets(new GraphWidget({
      title: "Throttles",
      left: [this.lambdaFunction.metricThrottles()],
      width: 24
    }))

    // Create Widget to show last 20 Log Entries
    this.dashboard.addWidgets(new LogQueryWidget({
      logGroupNames: [this.lambdaFunction.logGroup.logGroupName],
      queryLines:[
        "fields @timestamp, @message",
        "sort @timestamp desc",
        "limit 20"],
      width: 24,
      }))

    // Generate Outputs
    const cloudwatchDashboardURL = `https://${Aws.REGION}.console.aws.amazon.com/cloudwatch/home?region=${Aws.REGION}#dashboards:name=${props.dashboardName}`;
    new CfnOutput(this, 'DashboardOutput', {
      value: cloudwatchDashboardURL,
      description: 'URL of CloudWatch Dashboard',
      exportName: 'AiCrosswordLambdaStackDashboardURL'
    });
    new CfnOutput(this, 'LambdaName', {
      value: this.lambdaFunction.functionName,
      description: 'Name of the Ai Crossword Lambda Function',
      exportName: 'AiCrosswordLambdaName'
    });
    new CfnOutput(this, 'RestApiURL', {
      value: this.restApi.url,
      description: 'Url of the Ai Crossword Lambda Rest Api',
      exportName: 'AiCrosswordLambdaUrl'
    });
  };
}
