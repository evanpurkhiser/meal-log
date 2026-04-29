import {S3Client} from '@aws-sdk/client-s3';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    r2: S3Client;
  }
}

export const r2Plugin = fp(server => {
  const {config} = server;

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  });

  // Make R2 client available through the fastify server instance: server.r2
  server.decorate('r2', client);
});
