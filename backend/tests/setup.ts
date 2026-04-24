import { prisma } from '../src/utils/prisma.js';

// Clean the database before/after tests to ensure a fresh state
export const cleanDb = async () => {
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
};