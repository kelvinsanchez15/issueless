import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Avatar,
  Typography,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
} from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
  DeleteOutline as DeleteIcon,
  SettingsOutlined as SettingsIcon,
  MoreHoriz as MoreHorizIcon,
} from '@material-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import { PrismaClient } from '@prisma/client';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import Link from 'src/components/Link';
import NewComment from 'src/components/issues/issue/NewComment';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  openIssueChip: {
    marginRight: theme.spacing(0.5),
  },
  closedIssueChip: {
    marginRight: theme.spacing(0.5),
    backgroundColor: theme.palette.error.dark,
  },
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
  },
  headerAndButtonsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonsWraper: {
    '& > *': {
      marginLeft: theme.spacing(2),
    },
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
          <div className={classes.headerAndButtonsWrapper}>
            <Typography variant="h5">
              {issue.title}
              <Typography variant="h5" component="span" color="textSecondary">
                {` #${issue.number}`}
              </Typography>
            </Typography>
            <div className={classes.buttonsWraper}>
              <Button variant="outlined">Edit</Button>
              <Button
                color="secondary"
                variant="contained"
                component={Link}
                href={`/${username}/${repoName}/issues/new`}
                naked
              >
                New Issue
              </Button>
            </div>
          </div>

          <Typography variant="h6" gutterBottom>
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
            {`${issue.user.username} opened this issue 
          ${formatDate(issue.createdAt)}`}
          </Typography>

          <Divider />

          <Grid className={classes.root} container spacing={2}>
            <Grid item xs={9}>
              <Card>
                <CardHeader
                  className={classes.cardHeader}
                  avatar={
                    <Avatar src={issue.user.image} aria-label="user image" />
                  }
                  action={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <IconButton aria-label="settings">
                      <MoreHorizIcon />
                    </IconButton>
                  }
                  title={`${issue.user.username} commented 
            ${formatDate(issue.createdAt)}`}
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    {issue.body ? issue.body : 'No description provided.'}
                  </Typography>
                </CardContent>
              </Card>
              <NewComment />
            </Grid>

            <Grid item xs={3}>
              <List disablePadding>
                <ListItem divider>
                  <ListItemText
                    primary="Assignees"
                    secondary="No one assigned"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="select assignees">
                      <SettingsIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Labels" secondary="None yet" />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="select labels">
                      <SettingsIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <Button startIcon={<DeleteIcon />}>Delete issue</Button>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Container>
      </>
    </>
  );
}
