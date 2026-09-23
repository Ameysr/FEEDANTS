import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { setSupportsTransactions } from '../config/db';
import { Competition } from '../models/Competition';
import { Participation } from '../models/Participation';
import { User } from '../models/User';
import { harness } from './harness';

let replSet: MongoMemoryReplSet | undefined;

beforeAll(async () => {
  // A single-node replica set, so MongoDB multi-document transactions are available
  // and BOTH join strategies (transactional + compensating write) can be exercised.
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  const uri = replSet.getUri();

  harness.uri = uri;
  harness.transactions = true;

  await mongoose.connect(uri);
  setSupportsTransactions(true);

  await Promise.all([User.syncIndexes(), Competition.syncIndexes(), Participation.syncIndexes()]);
}, 240000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});
