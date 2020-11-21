import withSession from 'src/utils/withSession';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = async (req, res) => {
  if (!req.method === 'POST') {
    res.status(405).json({
      message: `The HTTP ${req.method} method is not supported at this route.`,
    });
    return;
  }
  try {
    const { owner, repo: repoName } = req.query;
    const userId = Number(req.session.userId);
    const { title, body, labels } = req.body;
    if (!title) {
      res.status(403).json({ message: '[title] field is required' });
      return;
    }
    const { id: ownerId } = await prisma.user.findOne({
      where: { username: owner },
      select: { id: true },
    });
    const data = {
      title,
      ...(body && { body }),
      ...(labels && { labels: { connect: labels } }),
      user: { connect: { id: userId } },
      repositories: {
        connect: {
          repositories_name_owner_id_key: { name: repoName, ownerId },
        },
      },
    };
    // const issue = await prisma.issue.create({
    //   data: { ...data, labels: { connect: [{ id: 28 }, { id: 29 }] } },
    // });
    const issue = await prisma.issue.create({ data });
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export default withSession(handler);
