#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AiCrosswordLambdaStack } from '../lib/ai-crossword-lambda-stack';
import { Builder } from '@sls-next/lambda-at-edge';
import { join } from 'path';
import { NextFrontendStack } from '../lib/next-frontend-stack';
import assert = require('assert');
import * as dotenv from 'dotenv';

export const cloudwatchDashboardName = "AiCrosswordLambdaDashboard";
export const nextFrontendDashboardName = "NextFrontendDashboardName";

async function start() {
  dotenv.config()
  const openaiApiKey = process.env.OPENAI_API_KEY;
  assert(openaiApiKey !== undefined, 'OpenAI API Key not provided');

  const nextPath = join(__dirname, '../../app');
  const outputPath = join(nextPath, '/build');
  const builder = new Builder(nextPath, outputPath, {
    cwd: nextPath,
    args: ['build'],
    baseDir: nextPath,
  });
  await builder.build(true);
  
  const domainName = 'aicrossword.app';
  const app = new cdk.App();
  const backendStack = new AiCrosswordLambdaStack(app, 'AiCrosswordLambdaStack', {
    dashboardName: cloudwatchDashboardName,
    domainName,
    openaiApiKey,
    env: {
      region: 'us-east-1',
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  });
  new NextFrontendStack(app, 'NextFrontendStack', {
    dashboardName: nextFrontendDashboardName,
    buildPath: outputPath,
    domainName,
    hostedZone: backendStack.hostedZone,
    certificate: backendStack.certificate,
    env: {
      region: 'us-east-1',
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  });
}

start();