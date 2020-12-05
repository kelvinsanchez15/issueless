import withSession from 'src/utils/withSession';
import prisma from 'src/utils/db/prisma';

const handler = async (req, res) => {
  const userId = Number(req.session.userId);
  const [, owner, repoName] = req.query.starred;

  if (!(req.method === 'PUT' || req.method === 'DELETE')) {
    res.status(405).json({
      message: `The HTTP ${req.method} method is not supported at this route.`,
    });
    return;
  }

  try {
    const user = await prisma.user.findOne({
      where: { username: owner },
      select: { id: true },
    });
    if (!user) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    const repository = await prisma.repository.findOne({
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

    if (req.method === 'PUT') {
      // Star a repository: PUT /api/user/starred/{owner}/{repo}
      const starredRepository = await prisma.star.create({
        data: {
          users: { connect: { id: userId } },
          repositories: { connect: { id: repository.id } },
        },
      });
      res.json(starredRepository);
    } else {
      // Unstar a repository: DELETE /api/user/starred/{owner}/{repo}
      const unstarredRepository = await prisma.star.delete({
        where: {
          stars_repository_id_user_id_key: {
            userId,
            repositoryId: repository.id,
          },
        },
      });
      res.json(unstarredRepository);
    }
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export default withSession(handler);
