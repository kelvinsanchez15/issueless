import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
  try {
    const labels = await prisma.label.findMany();
    return res.json(labels);
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong' });
  }
}
