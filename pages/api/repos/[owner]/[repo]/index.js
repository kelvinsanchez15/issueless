import { getSession } from 'next-auth/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { owner, repo: repoName } = req.query;
  switch (req.method) {
    case 'GET':
      try {
        // Get public repo: /api/{owner}]/{repo}
        const repository = await prisma.user
          .findOne({ where: { username: owner } })
          .repositories({
            where: { name: repoName },
            include: { user: true, stars: true },
          });
        if (!repository[0].id) {
          res.status(404).json({ message: 'Not found' });
          return;
        }
        res.json(repository[0]);
      } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'PATCH':
      try {
        // Update repo: /api/{owner}]/{repo}
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const userId = Number(session.userId);
        const user = await prisma.user.findOne({
          where: { username: owner },
          select: { id: true },
        });
        if (!user || user.id !== userId) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
        const { name, description } = req.body;
        const updates = {
          ...(name && { name }),
          ...(description && { description }),
        };
        const repository = await prisma.repository.update({
          where: {
            repositories_name_owner_id_key: { name: repoName, ownerId: userId },
          },
          data: updates,
        });
        res.json(repository);
      } catch (error) {
        if (error.code === 'P2016') {
          res.status(404).json({ message: 'Not found' });
          return;
        }
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'DELETE':
      try {
        // Delete repo: /api/{owner}]/{repo}
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const userId = Number(session.userId);
        const user = await prisma.user.findOne({
          where: { username: owner },
          select: { id: true },
        });
        if (!user || user.id !== userId) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
        await prisma.repository.delete({
          where: {
            repositories_name_owner_id_key: { name: repoName, ownerId: userId },
          },
        });
        res.status(204).end();
      } catch (error) {
        if (error.code === 'P2016') {
          res.status(404).json({ message: 'Not found' });
          return;
        }
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    default:
      res.status(405).json({
        message: `The HTTP ${req.method} method is not supported at this route.`,
      });
      break;
  }
}
