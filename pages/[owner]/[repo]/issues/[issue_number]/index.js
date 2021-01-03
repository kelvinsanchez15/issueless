import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Snackbar,
  StepConnector,
  Chip,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  DeleteOutline as DeleteIcon,
  SettingsOutlined as SettingsIcon,
} from '@material-ui/icons';
import { PrismaClient } from '@prisma/client';
import { useSession } from 'next-auth/client';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import IssueHeader from 'src/components/issues/issue/IssueHeader';
import IssueDetails from 'src/components/issues/issue/IssueDetails';
import IssueCommentList from 'src/components/issues/issue/IssueCommentList';
import NewComment from 'src/components/issues/issue/NewComment';
import getIssueAndComments from 'src/utils/db/getIssueAndComments';
import useSWR from 'swr';
import fetcher from 'src/utils/fetcher';
import getLabelStyle from 'src/utils/getLabelStyle';

const prisma = new PrismaClient();

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  labels: {
    paddingTop: theme.spacing(0.5),
    '& > *': {
      margin: theme.spacing(0, 0.5, 0.5, 0),
    },
  },
}));

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
        owner: issue.repositories.user.username,
        repo: issue.repositories.name,
        issue_number: String(issue.number),
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

export async function getStaticProps({ params }) {
  try {
    const issue = await getIssueAndComments(params, prisma);
    // Parse dates to avoid serializable error
    issue.createdAt = issue.createdAt.toISOString();
    issue.updatedAt = issue.updatedAt.toISOString();
    issue.closedAt = issue.closedAt ? issue.closedAt.toISOString() : null;
    issue.comments = issue.comments.map((comment) => {
      const createdAt = comment.createdAt.toISOString();
      const updatedAt = comment.updatedAt.toISOString();
      return { ...comment, createdAt, updatedAt };
    });
    return {
      props: { issue },
      revalidate: 2,
    };
  } catch (error) {
    if (error.message === 'Not found') {
      return { notFound: true };
    }
    throw Error(error);
  } finally {
    await prisma.$disconnect();
  }
}

export default function Issue({ issue: issueInitialData }) {
  const classes = useStyles();
  const router = useRouter();
  const { owner, repo: repoName, issue_number: issueNumber } = router.query;
  const [submitting, setSubmitting] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const [session] = useSession();
  const { data: issue } = useSWR(
    `/api/repos/${owner}/${repoName}/issues/${issueNumber}`,
    fetcher,
    {
      initialData: issueInitialData,
    }
  );
  const userHasValidSession = Boolean(session);
  const isRepoOwner = session?.username === owner;
  const userHasPermission = userHasValidSession && isRepoOwner;

  const handleIssueDelete = async () => {
    setErrorAlert({ ...errorAlert, open: false });
    try {
      const res = await fetch(
        `/api/repos/${owner}/${repoName}/issues/${issue.number}`,
        {
          method: 'DELETE',
        }
      );
      setSubmitting(false);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      router.replace(`/${owner}/${repoName}/issues`);
    } catch (error) {
      setErrorAlert({
        ...errorAlert,
        open: true,
        message: error.message,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{`${issue.title} · ${issue.number} · ${owner}/${repoName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <ProjectNavbar owner={owner} repoName={repoName} />
        <Container className={classes.root}>
          <IssueHeader
            title={issue.title}
            number={issue.number}
            state={issue.state}
            labels={issue.labels}
            createdAt={issue.createdAt}
            issueAuthor={issue.user.username}
          />

          <Grid className={classes.root} container spacing={2}>
            <Grid item xs={12} md={9}>
              <IssueDetails
                body={issue.body || undefined}
                createdAt={issue.createdAt}
                issueAuthor={issue.user.username}
                image={issue.user.image}
              />
              <StepConnector orientation="vertical" />
              <IssueCommentList comments={issue.comments} />
              {userHasValidSession && (
                <NewComment
                  state={issue.state}
                  issueAuthor={issue.user.username}
                  image={session?.user.image}
                />
              )}
            </Grid>

            <Grid item xs={12} md={3}>
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
                  <ListItemText
                    disableTypography
                    primary={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Typography color="textPrimary" variant="body1">
                        Labels
                      </Typography>
                    }
                    secondary={
                      issue.labels.length > 0 ? (
                        <div className={classes.labels}>
                          {issue.labels.map((label) => (
                            <Chip
                              key={label.name}
                              label={label.name}
                              size="small"
                              variant="outlined"
                              style={getLabelStyle(label.color)}
                            />
                          ))}
                        </div>
                      ) : (
                        <Typography color="textSecondary" variant="body2">
                          None yet
                        </Typography>
                      )
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="select labels">
                      <SettingsIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                {userHasPermission && (
                  <ListItem>
                    <Button
                      onClick={handleIssueDelete}
                      disabled={submitting}
                      startIcon={<DeleteIcon />}
                    >
                      Delete issue
                    </Button>
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>

          <Snackbar open={errorAlert.open} autoHideDuration={300}>
            <Alert severity="error">{errorAlert.message}</Alert>
          </Snackbar>
        </Container>
      </>
    </>
  );
}
