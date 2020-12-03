import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Button, Chip } from '@material-ui/core';
import { LocalOfferOutlined as LabelIcon } from '@material-ui/icons';
import { PrismaClient } from '@prisma/client';
import Link from 'src/components/Link';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import IssuesList from 'src/components/issues/IssuesList';
import IssuesFilter from 'src/components/issues/IssuesFilter';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  filterAndButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonsWraper: {
    '& > *': {
      marginLeft: theme.spacing(2),
    },
  },
  ml1: {
    marginLeft: theme.spacing(1),
  },
}));

const prisma = new PrismaClient();

export async function getServerSideProps({
  params: { owner, repo: repoName },
  query: { author, label, assignee, state, sort, page = 1, limit },
}) {
  // Filter
  const filter = {
    // GET /issues?author=kelvin123
    ...(author && { user: { username: author } }),
    // GET /issues?label=bug
    ...(label && { labels: { some: { name: label } } }),
    // GET /issues?assignee=mathew159
    ...(assignee && { assignee: { username: assignee } }),
    // GET /issues?state=open
    ...(state && { state }),
  };
  // Sorter
  const sorter = {};
  // GET /issues?sort=createdAt:asc || GET /issues?sort=updatedAt:desc
  if (sort) {
    const parts = sort.split(':');
    // eslint-disable-next-line prefer-destructuring
    sorter[parts[0]] = parts[1];
  } else {
    sorter.createdAt = 'desc';
  }
  // Pagination
  const take = limit || 15;
  const skip = (page - 1) * take;

  const user = await prisma.user.findOne({
    where: { username: owner },
    select: { id: true },
  });
  if (!user) return { notFound: true };
  const repository = await prisma.repository.findOne({
    where: {
      repositories_name_owner_id_key: { name: repoName, ownerId: user.id },
    },
    select: {
      id: true,
      name: true,
      issues: {
        take,
        skip,
        include: {
          user: { select: { username: true, id: true, image: true } },
          labels: true,
        },
        where: filter,
        orderBy: sorter,
      },
    },
  });
  if (!repository) return { notFound: true };
  // Counts
  const issuesCount = await prisma.issue.count({
    where: { ...filter, repositories: { name: repoName, ownerId: owner.id } },
  });
  repository.openIssuesCount = await prisma.issue.count({
    where: { repoId: repository.id, state: 'open' },
  });
  repository.closedIssuesCount = await prisma.issue.count({
    where: { repoId: repository.id, state: 'closed' },
  });
  repository.totalPages = Math.ceil(issuesCount / take);
  // Parse dates to avoid serializable error
  repository.issues = repository.issues.map((issue) => {
    const createdAt = issue.createdAt.toISOString();
    const updatedAt = issue.updatedAt.toISOString();
    return { ...issue, createdAt, updatedAt };
  });
  return {
    props: { repository, owner, repoName },
  };
}

export default function Issues({ repository, owner, repoName }) {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>{`Issues · ${owner}/${repoName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProjectNavbar owner={owner} repoName={repoName} />
      <Container className={classes.root}>
        <div className={classes.filterAndButtons}>
          <IssuesFilter />
          <div className={classes.buttonsWraper}>
            <Button variant="outlined" startIcon={<LabelIcon />}>
              Labels
              <Chip className={classes.ml1} label={9} size="small" />
            </Button>
            <Button
              color="secondary"
              variant="contained"
              component={Link}
              href={`/${owner}/${repoName}/issues/new`}
              naked
            >
              New Issue
            </Button>
          </div>
        </div>
        <IssuesList repository={repository} />
      </Container>
    </>
  );
}
