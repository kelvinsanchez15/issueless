import { getSession } from 'next-auth/client';
import { PrismaClient } from '@prisma/client';
import getIssueByQuery from 'src/utils/db/getIssueByQuery';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { query } = req;
  switch (req.method) {
    case 'POST':
      try {
        // Create comment: /api/{owner}]/{repo}/issues/{issue_number}/comments
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({ message: 'Please authenticate' });
          return;
        }
        const userId = Number(session.userId);
        const { body } = req.body;
        if (!body) {
          res.status(403).json({ message: '[body] field is required' });
          return;
        }
        const issue = await getIssueByQuery(query, prisma);
        const data = {
          body,
          user: { connect: { id: userId } },
          issue: { connect: { id: issue.id } },
        };
        const comment = await prisma.comment.create({ data });
        res.json(comment);
      } catch (error) {
        if (error.message === 'Not found') {
          res.status(404).json({ message: 'Not found' });
        } else {
          res.status(400).json({ message: 'Something went wrong' });
        }
      }
      break;
    case 'GET':
      try {
        const issue = await getIssueByQuery(query, prisma);
        const comments = await prisma.comment.findMany({
          where: { issueId: issue.id },
          include: { user: { select: { username: true, image: true } } },
        });
        res.json(comments);
      } catch (error) {
        if (error.message === 'Not found') {
          res.status(404).json({ message: 'Not found' });
        } else {
          res.status(400).json({ message: 'Something went wrong' });
        }
      }
      break;
    default:
      res.status(405).json({
        message: `The HTTP ${req.method} method is not supported at this route.`,
      });
      break;
  }
}
