import env from '@fastify/env';
import type {JSONSchemaType} from 'env-schema';
import fp from 'fastify-plugin';

interface EnvConfig {
  PORT: number;
  OPENAI_TOKEN: string;
  /**
   * Token required to be present on the `/record` upload to accept a
   * logged day of meals
   */
  RECORD_TOKEN: string;
  /**
   * Cloudflare R2 Account ID
   */
  R2_ACCOUNT_ID: string;
  /**
   * Cloudflare R2 Access Key ID
   */
  R2_ACCESS_KEY_ID: string;
  /**
   * Cloudflare R2 Secret Access Key
   */
  R2_SECRET_ACCESS_KEY: string;
  /**
   * Cloudflare R2 Bucket Name
   */
  R2_BUCKET_NAME: string;
}

const schema: JSONSchemaType<EnvConfig> = {
  type: 'object',
  required: [
    'PORT',
    'OPENAI_TOKEN',
    'RECORD_TOKEN',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
  ],
  properties: {
    PORT: {
      type: 'number',
      default: 3006,
    },
    OPENAI_TOKEN: {
      type: 'string',
    },
    RECORD_TOKEN: {
      type: 'string',
    },
    R2_ACCOUNT_ID: {
      type: 'string',
    },
    R2_ACCESS_KEY_ID: {
      type: 'string',
    },
    R2_SECRET_ACCESS_KEY: {
      type: 'string',
    },
    R2_BUCKET_NAME: {
      type: 'string',
    },
  },
} as const;

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
  }
}

export const configPlugin = fp(async server => {
  await server.register(env, {confKey: 'config', schema}).after();
});
