import type {FastifyInstance} from 'fastify';

// oxlint-disable-next-line require-await
async function indexController(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get('/', async (_request, reply) => {
    const days = await prisma.day.findMany({
      orderBy: {datetime: 'desc'},
      include: {
        meals: {
          orderBy: {dateRecorded: 'asc'},
          include: {photos: true},
        },
      },
    });
    reply.code(200).send({days});
  });
}

export default indexController;
