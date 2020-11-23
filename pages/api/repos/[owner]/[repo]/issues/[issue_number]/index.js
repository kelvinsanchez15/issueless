import withSession from 'src/utils/withSession';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const { owner, repo: repoName, issue_number: issueNumber } = req.query;
  const userId = Number(req.session.userId);

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
  const issue = await prisma.issue.findOne({
    where: {
      Issue_number_repo_id_key: {
        number: Number(issueNumber),
        repoId: repository.id,
      },
    },
    select: { id: true, userId: true },
  });
  if (!issue) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  // Check if the one making the request is the repo owner or issue owner
  if (user.id !== userId && issue.userId !== userId) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  switch (req.method) {
    case 'PATCH':
      try {
        // Update issue: /api/{owner}]/{repo}/issues/{issue_number}
        const { title, body, labels } = req.body;
        const updates = {
          ...(title && { title }),
          ...(body && { body }),
          ...(labels && { labels: { connect: labels } }),
        };
        const updatedIssue = await prisma.issue.update({
          where: { id: issue.id },
          data: updates,
        });
        res.json(updatedIssue);
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
        // Delete issue: /api/{owner}]/{repo}/issues/{issue_number}
        await prisma.issue.delete({ where: { id: issue.id } });
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
};

export default withSession(handler);
