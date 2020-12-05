import { getSession } from 'next-auth/client';
import { PrismaClient } from '@prisma/client';
import getIssueAndComments from 'src/utils/db/getIssueAndComments';
import getIssueByQuery from 'src/utils/db/getIssueByQuery';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { query } = req;
  switch (req.method) {
    case 'GET':
      try {
        const issueAndComments = await getIssueAndComments(query, prisma);
        res.json(issueAndComments);
      } catch (error) {
        if (error.message === 'Not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'PATCH':
      try {
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const loggedUser = session.username;
        const { owner: repoOwner } = req.query;
        const issue = await getIssueByQuery(query, prisma);
        const isIssueOwner = loggedUser === issue.user.username;
        const isRepoOwner = loggedUser === repoOwner;
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
        if (error.message === 'Not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'DELETE':
      try {
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const loggedUser = session.username;
        const { owner: repoOwner } = req.query;
        // Allow only the repo owner permission to delete issues
        if (loggedUser !== repoOwner) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
        const issue = await getIssueByQuery(query, prisma);
        // Delete issue: /api/{owner}]/{repo}/issues/{issue_number}
        await prisma.issue.delete({ where: { id: issue.id } });
        res.status(204).end();
      } catch (error) {
        if (error.message === 'Not found') {
          res.status(404).json({ message: error.message });
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
