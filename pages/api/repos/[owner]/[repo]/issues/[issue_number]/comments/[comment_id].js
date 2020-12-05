import withSession from 'src/utils/withSession';
import prisma from 'src/utils/db/prisma';

const handler = async (req, res) => {
  const { username: loggedUser } = req.session;
  const { owner: repoOwner, comment_id: commentId } = req.query;

  const comment = await prisma.comment.findOne({
    where: { id: Number(commentId) },
    select: { user: { select: { username: true } } },
  });
  if (!comment) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const commentOwner = comment.user.username;

  // Allow only the comment owner or repo owner permission to update and delete comments
  if (!(loggedUser === commentOwner || loggedUser === repoOwner)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  switch (req.method) {
    case 'PATCH':
      try {
        // Update issue: /api/{owner}]/{repo}/issues/{issue_number}/comments/{comment_id}
        const { body } = req.body;
        if (!body) {
          res.status(403).json({ message: '[body] field is required' });
          return;
        }
        const updatedComment = await prisma.comment.update({
          where: { id: Number(commentId) },
          data: { body },
        });
        res.json(updatedComment);
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
        // Delete issue: /api/{owner}]/{repo}/issues/{issue_number}/comments/{comment_id}
        await prisma.comment.delete({ where: { id: Number(commentId) } });
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
