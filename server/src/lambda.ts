// USE ONLY IF DEPLOYING TO LAMBDA VIA @fastify/aws-lambda

import awsLambdaFastify from '@fastify/aws-lambda';
import server from './server';

export const handler = awsLambdaFastify(server, {
    decorateRequest: false,
    serializeLambdaArguments: false,
});