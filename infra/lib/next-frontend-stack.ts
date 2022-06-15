import { Stack, StackProps, CfnOutput, Aws } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { GraphWidget, Dashboard, LogQueryWidget, TextWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { Function, Runtime, AssetCode } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import { NextJSLambdaEdge } from '@sls-next/cdk-construct';
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";

interface NextFrontendStackProps extends StackProps {
  dashboardName: string
  buildPath: string
  domainName: string
  hostedZone: IHostedZone
  certificate: DnsValidatedCertificate
}

export class NextFrontendStack extends Stack {
  private nextLambda: NextJSLambdaEdge
  private dashboard: Dashboard

  constructor(scope: Construct, id: string, props: NextFrontendStackProps) {
    super(scope, id, props);

    this.nextLambda = new NextJSLambdaEdge(this, 'NextJsApp', {
      serverlessBuildOutDir: props.buildPath,
      domain: {
        hostedZone: props.hostedZone,
        certificate: props.certificate,
        domainNames: [props.domainName, `www.${props.domainName}`],
      },
    });

    // Create CloudWatch Dashboard
    this.dashboard = new Dashboard(this, "NextFrontendLambdaDashboard", {
      dashboardName: props.dashboardName
    })

    // Create Title for Dashboard
    this.dashboard.addWidgets(new TextWidget({
      markdown: `# Dashboard: ${this.nextLambda.defaultNextLambda.functionName}`,
      height: 1,
      width: 24
    }))

    // Create CloudWatch Dashboard Widgets: Errors, Invocations, Duration, Throttles
    this.dashboard.addWidgets(new GraphWidget({
      title: "Invocations",
      left: [this.nextLambda.defaultNextLambda.metricInvocations()],
      width: 24
    }))

    this.dashboard.addWidgets(new GraphWidget({
      title: "Errors",
      left: [this.nextLambda.defaultNextLambda.metricErrors()],
      width: 24
    }))

    this.dashboard.addWidgets(new GraphWidget({
      title: "Duration",
      left: [this.nextLambda.defaultNextLambda.metricDuration()],
      width: 24
    }))

    this.dashboard.addWidgets(new GraphWidget({
      title: "Throttles",
      left: [this.nextLambda.defaultNextLambda.metricThrottles()],
      width: 24
    }))

    // Create Widget to show last 20 Log Entries
    this.dashboard.addWidgets(new LogQueryWidget({
      logGroupNames: [this.nextLambda.defaultNextLambda.logGroup.logGroupName],
      queryLines:[
        "fields @timestamp, @message",
        "sort @timestamp desc",
        "limit 20"],
      width: 24,
      }))

    // Generate Outputs
    const cloudwatchDashboardURL = `https://${Aws.REGION}.console.aws.amazon.com/cloudwatch/home?region=${Aws.REGION}#dashboards:name=${props.dashboardName}`;
    new CfnOutput(this, 'FrontendDashboardOutput', {
      value: cloudwatchDashboardURL,
      description: 'URL of CloudWatch Dashboard',
      exportName: 'NextFrontendStackDashboardURL'
    });
    // new CfnOutput(this, 'NextFrontendStackUrlOutput', {
    //   value: this.,
    //   description: 'Url of the next frontend',
    //   exportName: 'NextFrontendUrl'
    // });
  };
}
