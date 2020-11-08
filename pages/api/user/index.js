import withSession from 'src/utils/withSession';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const userId = Number(req.session.userId);
  switch (req.method) {
    case 'GET':
      try {
        const user = await prisma.user.findOne({ where: { id: userId } });
        res.json(user);
      } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'PATCH':
      try {
        const { name, bio, username } = req.body;
        // TODO: sanitize fields (Ex. no empty spaces)
        const updates = {
          ...(name && { name }),
          ...(bio && { bio }),
          ...(username && { username }),
        };
        const user = await prisma.user.update({
          where: { id: userId },
          data: updates,
        });
        res.json(user);
      } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
      }
      break;
    case 'DELETE':
      try {
        const { username, verification } = req.body;
        const user = await prisma.user.findOne({ where: { username } });
        if (!user || user.id !== userId) {
          res.status(400).json({ message: 'Please provide a valid username' });
          return;
        }
        if (verification !== 'delete my account') {
          res
            .status(400)
            .json({ message: 'Please provide a valid verification message' });
          return;
        }
        const deletedUser = await prisma.user.delete({ where: { id: userId } });
        await prisma.session.deleteMany({ where: { userId } });
        await prisma.account.deleteMany({ where: { userId } });
        res.json(deletedUser);
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
};

export default withSession(handler);
