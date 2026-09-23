import mongoose from 'mongoose';
import { env, isTest } from './env';
import { logger } from '../utils/logger';

/** True when the connected deployment supports multi-document transactions (replica set / sharded). */
let transactionsSupported = false;

export function supportsTransactions(): boolean {
  return transactionsSupported;
}

/** Override detected capability (used by the test harness / ops tooling). */
export function setSupportsTransactions(value: boolean): void {
  transactionsSupported = value;
}

async function detectTransactionSupport(): Promise<boolean> {
  try {
    const db = mongoose.connection.db;
    if (!db) return false;
    const hello = (await db.admin().command({ hello: 1 })) as { setName?: string; msg?: string };
    // Standalone servers report msg: 'isdbgrid' is sharded (supported); setName means replica set.
    return Boolean(hello.setName) || hello.msg === 'isdbgrid';
  } catch {
    return false;
  }
}

export async function connectDB(uri: string = env.MONGODB_URI): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !isTest || true,
  });

  transactionsSupported = await detectTransactionSupport();
  logger.info(
    `MongoDB transactions ${transactionsSupported ? 'ENABLED (replica set)' : 'unavailable (standalone) - using compensating writes'}`,
  );

  // Ensure unique/compound indexes exist before serving traffic.
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()));
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
