import prisma from 'src/utils/db/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
  const { username } = req.query;
  try {
    const user = await prisma.user.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Not found' });
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong' });
  }
}
