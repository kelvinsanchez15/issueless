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

const prisma = new PrismaClient();

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
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
            createdAt={issue.createdAt}
            username={issue.user.username}
          />

          <Grid className={classes.root} container spacing={2}>
            <Grid item xs={9}>
              <IssueDetails
                body={issue.body || undefined}
                createdAt={issue.createdAt}
                username={issue.user.username}
                image={issue.user.image}
              />
              <StepConnector orientation="vertical" />
              <IssueCommentList comments={issue.comments} />
              {userHasValidSession && (
                <NewComment state={issue.state} image={session?.user.image} />
              )}
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
                {userHasValidSession && isRepoOwner && (
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
