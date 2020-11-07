import { getSession } from 'next-auth/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      try {
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const id = Number(session.userId);
        const { name, description } = req.body;
        if (!name) {
          res.status(403).json({ message: '[name] field is required' });
          return;
        }
        const data = {
          name,
          ...(description && { description }),
          user: { connect: { id } },
        };
        const repo = await prisma.repository.create({ data });
        res.status(201).json(repo);
      } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'GET':
      try {
        // Get public repo: /api/{owner}]/{repo}
        const owner = req.query.repos[1];
        const repoName = req.query.repos[2];
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

    default:
      res.status(405).json({
        message: `The HTTP ${req.method} method is not supported at this route.`,
      });
      break;
  }
}
