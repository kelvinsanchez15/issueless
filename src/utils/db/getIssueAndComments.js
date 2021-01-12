const getIssueAndComments = async (query, prisma) => {
  const { owner, repo: repoName, issue_number: issueNumber } = query;
  const user = await prisma.user.findUnique({
    where: { username: owner },
    select: { id: true },
  });
  if (!user) {
    throw new Error('Not found');
  }
  const repository = await prisma.repository.findUnique({
    where: {
      repositories_name_owner_id_key: {
        name: repoName,
        ownerId: user.id,
      },
    },
    select: { id: true },
  });
  if (!repository) {
    throw new Error('Not found');
  }
  const issue = await prisma.issue.findUnique({
    where: {
      Issue_number_repo_id_key: {
        number: Number(issueNumber),
        repoId: repository.id,
      },
    },
    include: {
      user: { select: { username: true, image: true } },
      comments: {
        include: { user: { select: { username: true, image: true } } },
      },
      labels: true,
    },
  });
  if (!issue) {
    throw new Error('Not found');
  }
  return issue;
};

export default getIssueAndComments;
