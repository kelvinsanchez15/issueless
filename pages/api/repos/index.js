import withSession from 'src/utils/withSession';
import prisma from 'src/utils/db/prisma';
import slugify from 'src/utils/slugify';

const handler = async (req, res) => {
  if (!req.method === 'POST') {
    res.status(405).json({
      message: `The HTTP ${req.method} method is not supported at this route.`,
    });
    return;
  }
  try {
    const userId = Number(req.session.userId);
    const { name, description } = req.body;
    if (!name) {
      res.status(403).json({ message: '[name] field is required' });
      return;
    }
    const data = {
      name: slugify(name),
      ...(description && { description }),
      user: { connect: { id: userId } },
    };
    const repo = await prisma.repository.create({ data });
    res.status(201).json(repo);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export default withSession(handler);
