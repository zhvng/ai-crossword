import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import assert = require('assert');
import App from './App';

dotenv.config();
assert(process.env.OPENAI_API_KEY !== undefined);
assert(process.env.STAGE !== undefined);
const openAiAPIKey: string = process.env.OPENAI_API_KEY;

const app = new App(openAiAPIKey);

const server = Fastify({
  logger: process.env.STAGE === 'dev'
});

server.register(cors, {
    origin: "*",
});

server.addHook('onRequest', (request, _reply, done) => {
    if (request.routerPath) console.log(request.routerMethod, request.routerPath);
    done();
})

server.post('/generatemini', async (_request, _reply) => {
    const exportedPuzzle = await app.generateMiniCrossword();
    console.log('success! result:', exportedPuzzle);
    return exportedPuzzle;
})

/**
 * Run the server!
 */
const start = async (port: number) => {
  try {
    await server.listen({ port });
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// if called directly, e.g. node server
if (require.main === module) {
  assert(process.env.PORT !== undefined);
  const port: number = parseInt(process.env.PORT);
  start(port);
}

export default server ;