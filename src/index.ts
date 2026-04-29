import multipart from '@fastify/multipart';
import {program} from 'commander';
import type {FastifyLoggerOptions} from 'fastify';
import fastify from 'fastify';
import type {PinoLoggerOptions} from 'fastify/types/logger';

import {configPlugin} from './config';
import {openaiPlugin} from './openai-plugin';
import {prismaPlugin} from './prisma-plugin';
import {r2Plugin} from './r2-plugin';
import router from './router';

async function boot() {
  const env = process.env.NODE_ENV ?? 'production';

  const loggingConfig: Record<
    string,
    boolean | FastifyLoggerOptions | PinoLoggerOptions
  > = {
    development: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    production: true,
    test: false,
  };
  const logger = loggingConfig[env];

  const server = fastify({logger});

  await server.register(configPlugin).after();
  await server
    .register(multipart, {
      limits: {
        fileSize: 1024 * 1024 * 1024 * 20,
      },
    })
    .register(prismaPlugin)
    .register(openaiPlugin)
    .register(r2Plugin)
    .after();

  server.register(router);

  program
    .command('server')
    .description('Start the meal-log server')
    .action(async () => {
      await server.listen({host: '0.0.0.0', port: server.config.PORT});
    });

  await program.parseAsync();
}

boot();
