import type {FastifyInstance} from 'fastify';

import indexController from './controller/indexController';
import recordController from './controller/recordController';

// oxlint-disable-next-line require-await
export default async function router(fastify: FastifyInstance) {
  fastify.register(indexController);
  fastify.register(recordController);
}
