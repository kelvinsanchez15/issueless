import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Divider,
} from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
} from '@material-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import { PrismaClient } from '@prisma/client';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  openIssueChip: {
    marginRight: theme.spacing(0.5),
  },
  closedIssueChip: {
    marginRight: theme.spacing(0.5),
    backgroundColor: theme.palette.error.dark,
  },
}));

const prisma = new PrismaClient();

export async function getStaticPaths() {
  try {
    const issues = await prisma.issue.findMany({
      include: {
        repositories: {
          select: { user: { select: { username: true } }, name: true },
        },
      },
    });
    const paths = issues.map((issue) => ({
      params: {
        username: issue.repositories.user.username,
        repo: issue.repositories.name,
        issue: String(issue.number),
      },
    }));
    return {
      paths,
      fallback: 'blocking',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getStaticProps({
  params: { username, repo: repoName, issue: issueNumber },
}) {
  try {
    const owner = await prisma.user.findOne({
      where: { username },
      select: { id: true },
    });
    if (!owner) return { notFound: true };
    const repository = await prisma.repository.findOne({
      where: {
        repositories_name_owner_id_key: { name: repoName, ownerId: owner.id },
      },
    });
    if (!repository) return { notFound: true };
    const issue = await prisma.issue.findOne({
      where: {
        Issue_number_repo_id_key: {
          number: Number(issueNumber),
          repoId: repository.id,
        },
      },
      include: { user: { select: { username: true, image: true } } },
    });
    if (!issue) return { notFound: true };
    // Parse dates to avoid serializable error
    issue.createdAt = issue.createdAt.toISOString();
    issue.updatedAt = issue.updatedAt.toISOString();
    return {
      props: { issue, username, repoName },
      revalidate: 2,
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function Issue({ issue, username, repoName }) {
  const classes = useStyles();

  const formatDate = (date) =>
    formatDistanceToNow(new Date(date), { addSuffix: true });

  return (
    <>
      <Head>
        <title>{`${issue.title} · ${issue.number} · ${username}/${repoName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <ProjectNavbar username={username} repoName={repoName} />
        <Container className={classes.root}>
          <Typography variant="h5" gutterBottom>
            {issue.state === 'open' ? (
              <Chip
                icon={<OpenIssueIcon titleAccess="Open issue" />}
                label="Open"
                color="secondary"
                className={classes.openIssueChip}
              />
            ) : (
              <Chip
                icon={<ClosedIssueIcon titleAccess="Clossed issue" />}
                label="Closed"
                className={classes.closedIssueChip}
              />
            )}
            {issue.title}
            <Typography variant="h5" component="span" color="textSecondary">
              {` #${issue.number}`}
            </Typography>
          </Typography>

          <Typography variant="h6" gutterBottom>
            {`${issue.user.username} opened this issue 
          ${formatDate(issue.createdAt)}`}
          </Typography>

          <Divider />

          <Card className={classes.root}>
            <CardHeader
              avatar={<Avatar src={issue.user.image} aria-label="user image" />}
              title={`${issue.user.username} commented 
            ${formatDate(issue.createdAt)}`}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {issue.body}
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </>
    </>
  );
}
