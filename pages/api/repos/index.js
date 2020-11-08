import { getSession } from 'next-auth/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (!req.method === 'POST') {
    res.status(405).json({
      message: `The HTTP ${req.method} method is not supported at this route.`,
    });
    return;
  }
  try {
    const session = await getSession({ req });
    if (!session) {
      res.status(401).json({ message: 'Please authenticate' });
      return;
    }
    const userId = Number(session.userId);
    const { name, description } = req.body;
    if (!name) {
      res.status(403).json({ message: '[name] field is required' });
      return;
    }
    const data = {
      name,
      ...(description && { description }),
      user: { connect: { id: userId } },
    };
    const repo = await prisma.repository.create({ data });
    res.status(201).json(repo);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
}
