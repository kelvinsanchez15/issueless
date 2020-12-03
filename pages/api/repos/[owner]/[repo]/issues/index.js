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

  const { owner: repoOwner, repo: repoName } = req.query;
  const { username: loggedUser } = req.session;
  const isRepoOwner = loggedUser === repoOwner;

  const user = await prisma.user.findOne({
    where: { username: repoOwner },
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

  try {
    const { title, body, assignee, labels } = req.body;
    if (!title) {
      res.status(403).json({ message: '[title] field is required' });
      return;
    }
    const data = {
      title,
      ...(body && { body }),
      // Allow only the repo owner to add "assignee" and "labels" fields
      ...(assignee && isRepoOwner && { assignee }),
      ...(labels && isRepoOwner && { labels: { connect: labels } }),
    };
    const issue = await prisma.issue.create({
      data: {
        ...data,
        user: { connect: { username: loggedUser } },
        repositories: { connect: { id: repository.id } },
      },
    });
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export default withSession(handler);
