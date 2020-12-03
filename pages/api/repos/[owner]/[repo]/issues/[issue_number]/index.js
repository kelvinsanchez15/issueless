import withSession from 'src/utils/withSession';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const { username: loggedUser } = req.session;
  const {
    owner: repoOwner,
    repo: repoName,
    issue_number: issueNumber,
  } = req.query;

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
  const issue = await prisma.issue.findOne({
    where: {
      Issue_number_repo_id_key: {
        number: Number(issueNumber),
        repoId: repository.id,
      },
    },
    select: { id: true, user: { select: { username: true } } },
  });
  if (!issue) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const isIssueOwner = loggedUser === issue.user.username;
  const isRepoOwner = loggedUser === repoOwner;

  switch (req.method) {
    case 'PATCH':
      try {
        // Allow only the issue owner or repo owner permission to update issues
        if (!(isIssueOwner || isRepoOwner)) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
        // Update issue: /api/{owner}]/{repo}/issues/{issue_number}
        const { title, body, state, assignee, labels } = req.body;
        const updates = {
          ...(title && { title }),
          ...(body && { body }),
          ...(state && { state }),
          // Allow only the repo owner to update "assignee" and "labels" fields
          ...(assignee && isRepoOwner && { assignee }),
          ...(labels && isRepoOwner && { labels: { connect: labels } }),
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
        // Allow only the repo owner permission to delete issues
        if (!isRepoOwner) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
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
