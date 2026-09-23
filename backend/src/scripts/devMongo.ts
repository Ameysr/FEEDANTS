/**
 * Runs a local, in-memory MongoDB instance so the API can be developed and
 * demoed without installing MongoDB or Docker.
 *
 *   npm run mongo:dev
 *
 * Data lives only as long as this process runs. In another terminal:
 *   npm run seed
 *   npm run dev
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const port = Number(process.env.MONGO_PORT ?? 27017);

async function main(): Promise<void> {
  const server = await MongoMemoryServer.create({
    instance: { port, dbName: 'feedants', storageEngine: 'wiredTiger' },
  });

  const uri = `mongodb://127.0.0.1:${port}/feedants`;

  // eslint-disable-next-line no-console
  console.log(`\nIn-memory MongoDB running.\n\n  MONGODB_URI=${uri}\n`);
  // eslint-disable-next-line no-console
  console.log('In another terminal run:  npm run seed  &&  npm run dev\n');
  // eslint-disable-next-line no-console
  console.log(`(server reported: ${server.getUri()})`);

  const shutdown = async (): Promise<void> => {
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start in-memory MongoDB', err);
  process.exit(1);
});
