import Head from 'next/head';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Button, Chip, Hidden } from '@material-ui/core';
import {
  LocalOfferOutlined as LabelIcon,
  Clear as ClearIcon,
} from '@material-ui/icons';
import prisma from 'src/utils/db/prisma';
import { join } from '@prisma/client';
import Link from 'src/components/Link';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import IssuesList from 'src/components/issues/IssuesList';
import IssuesFilter from 'src/components/issues/IssuesFilter';
import OpenClosedIssuesButton from 'src/components/issues/OpenClosedIssuesButton';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  filterAndButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  buttonsWraper: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2),
    },
  },
  ml1: {
    marginLeft: theme.spacing(1),
  },
  mt1: {
    marginTop: theme.spacing(1),
  },
  mr2: {
    marginRight: theme.spacing(2),
  },
}));

export async function getServerSideProps({
  res,
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
    ...(assignee && { assignee }),
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
  if (repository.issues.length > 0) {
    const issuesIds = repository.issues.map((issue) => issue.id);
    const issuesWithCommentCount = await prisma.$queryRaw`
    SELECT "Issue".id,    
    COUNT(DISTINCT "Comment".id) AS comments
    FROM "Issue"
    LEFT JOIN "Comment" ON "Comment".issue_id = "Issue".id
    GROUP BY "Issue".id
    HAVING "Issue".id IN (${join(issuesIds)})
  `;
    // Merge issues list with issuesWithCommentCount to get comment count field on each issue
    repository.issues = repository.issues.map((issue) => ({
      ...issue,
      ...issuesWithCommentCount.find(
        (issueWithCount) => issueWithCount.id === issue.id
      ),
    }));
  }

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
    const closedAt = issue.closedAt ? issue.closedAt.toISOString() : null;
    return { ...issue, createdAt, updatedAt, closedAt };
  });

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=1, stale-while-revalidate=59'
  );

  return {
    props: { repository, owner, repoName },
  };
}

export default function Issues({ repository, owner, repoName }) {
  const classes = useStyles();
  const router = useRouter();
  const { query } = router;
  const properties = ['state', 'author', 'label', 'assignee', 'sort'];
  const shouldRenderClearButton = properties.some((prop) =>
    Object.prototype.hasOwnProperty.call(query, prop)
  );

  return (
    <>
      <Head>
        <title>{`Issues · ${owner}/${repoName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProjectNavbar owner={owner} repoName={repoName} />
      <Container className={classes.root}>
        <div>
          <div className={classes.filterAndButtons}>
            <IssuesFilter />
            <div className={classes.buttonsWraper}>
              <Button
                className={classes.mr2}
                variant="outlined"
                startIcon={<LabelIcon />}
              >
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
                <Hidden smDown implementation="css">
                  <span>New Issue</span>
                </Hidden>
                <Hidden mdUp implementation="css">
                  <span>New</span>
                </Hidden>
              </Button>
            </div>
          </div>
          <div className={classes.mt1}>
            {shouldRenderClearButton && (
              <Button
                startIcon={<ClearIcon />}
                variant="text"
                component={Link}
                href={`/${owner}/${repoName}/issues`}
                size="small"
                naked
              >
                Clear current search query, filters, and sorts
              </Button>
            )}

            <Hidden mdUp implementation="css">
              <OpenClosedIssuesButton
                query={query}
                openIssuesCount={repository.openIssuesCount}
                closedIssuesCount={repository.closedIssuesCount}
              />
            </Hidden>
          </div>
        </div>
      </Container>

      <IssuesList repository={repository} />
    </>
  );
}
