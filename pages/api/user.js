import withSession from 'src/utils/withSession';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const id = Number(req.session.userId);
  switch (req.method) {
    case 'GET':
      try {
        const user = await prisma.user.findOne({ where: { id } });
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
          where: { id },
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
        if (!user || user.id !== id) {
          throw new Error('Please provide a valid username');
        }
        if (verification !== 'delete my account') {
          throw new Error('Please provide a valid verification message');
        }
        const deletedUser = await prisma.user.delete({ where: { id } });
        await prisma.session.deleteMany({ where: { userId: id } });
        await prisma.account.deleteMany({ where: { userId: id } });
        res.json(deletedUser);
      } catch (error) {
        res.status(400).json({ message: error.message });
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
