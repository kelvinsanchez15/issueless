import { PrismaClient } from '@prisma/client';
import usersMockData from 'src/utils/user-mock-data.json';

const prisma = new PrismaClient();

const labels = [
  {
    name: 'bug',
    color: 'd73a4a',
    description: "Something isn't working",
  },
  {
    name: 'documentation',
    color: '0075ca',
    description: 'Improvements or additions to documentation',
  },
  {
    name: 'duplicate',
    color: 'cfd3d7',
    description: 'This issue or pull request already exists',
  },
  {
    name: 'enhancement',
    color: 'a2eeef',
    description: 'New feature or request',
  },
  {
    name: 'good first issue',
    color: '7057ff',
    description: 'Good for newcomers',
  },
  {
    name: 'help wanted',
    color: '008672',
    description: 'Extra attention is needed',
  },
  {
    name: 'invalid',
    color: 'e4e669',
    description: "This doesn't seem right",
  },
  {
    name: 'question',
    color: 'd876e3',
    description: 'Further information is requested',
  },
  {
    name: 'wontfix',
    color: 'ffffff',
    description: 'This will not be worked on',
  },
];

export default async function handler(req, res) {
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.label.deleteMany({});
  // Create mock users with mock repositoreis
  Promise.all(usersMockData.map((user) => prisma.user.create({ data: user })));
  // Create default labels
  Promise.all(labels.map((label) => prisma.label.create({ data: label })));

  const repositories = await prisma.user
    .findOne({
      where: { username: usersMockData[0].username },
    })
    .repositories();

  // Create issues for a repo
  await usersMockData.reduce(async (previousPromise, user) => {
    await previousPromise;
    return prisma.issue.create({
      data: {
        title: user.bio,
        body: user.repositories.create[0].description,
        user: { connect: { username: user.username } },
        repositories: { connect: { id: repositories[0].id } },
      },
    });
  }, Promise.resolve());

  const allUsers = await prisma.user.findMany({
    include: { repositories: { include: { issues: true } } },
  });

  res.json(allUsers);
}
