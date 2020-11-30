export default async function getIssueByQuery(query, prisma) {
  const { owner, repo: repoName, issue_number: issueNumber } = query;
  const user = await prisma.user.findOne({
    where: { username: owner },
    select: { id: true },
  });
  if (!user) {
    throw new Error('Not found');
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
    throw new Error('Not found');
  }
  const issue = await prisma.issue.findOne({
    where: {
      Issue_number_repo_id_key: {
        number: Number(issueNumber),
        repoId: repository.id,
      },
    },
    select: { id: true },
  });
  if (!issue) {
    throw new Error('Not found');
  }
  return issue;
}
