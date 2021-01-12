import prisma from 'src/utils/db/prisma';
import { getSession } from 'next-auth/client';

export default async function handler(req, res) {
  const { owner, repo: repoName } = req.query;
  const user = await prisma.user.findUnique({
    where: { username: owner },
    select: { id: true },
  });
  if (!user) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const repository = await prisma.repository.findUnique({
    where: {
      repositories_name_owner_id_key: {
        name: repoName,
        ownerId: user.id,
      },
    },
    select: { id: true },
  });
  if (!repository) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const session = await getSession({ req });
  switch (req.method) {
    case 'GET':
      try {
        const stargazers = await prisma.star.findMany({
          where: { repositoryId: repository.id },
        });
        let starred = false;
        if (session) {
          const userId = Number(session.userId);
          starred = stargazers.some((stargazer) => stargazer.userId === userId);
        }
        const stargazersCount = await prisma.star.count({
          where: { repositoryId: repository.id },
        });
        res.json({
          stargazers,
          stargazers_count: stargazersCount,
          starred: Boolean(starred),
        });
      } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'PUT':
      try {
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const userId = Number(session.userId);
        const starredRepository = await prisma.star.create({
          data: {
            users: { connect: { id: userId } },
            repositories: { connect: { id: repository.id } },
          },
        });
        res.json(starredRepository);
      } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'DELETE':
      try {
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const userId = Number(session.userId);
        const unstarredRepository = await prisma.star.delete({
          where: {
            stars_repository_id_user_id_key: {
              userId,
              repositoryId: repository.id,
            },
          },
        });
        res.json(unstarredRepository);
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
