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
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  DeleteOutline as DeleteIcon,
  SettingsOutlined as SettingsIcon,
} from '@material-ui/icons';
import { PrismaClient } from '@prisma/client';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import IssueHeader from 'src/components/issues/issue/IssueHeader';
import IssueComment from 'src/components/issues/issue/IssueComment';
import NewComment from 'src/components/issues/issue/NewComment';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
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
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });

  const handleIssueDelete = async () => {
    setErrorAlert({ ...errorAlert, open: false });
    try {
      const res = await fetch(
        `/api/repos/${username}/${repoName}/issues/${issue.number}`,
        {
          method: 'DELETE',
        }
      );
      setSubmitting(false);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      router.replace(`/${username}/${repoName}/issues`);
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
        <title>{`${issue.title} · ${issue.number} · ${username}/${repoName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <ProjectNavbar username={username} repoName={repoName} />
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
              <IssueComment
                body={issue.body || undefined}
                number={issue.number}
                createdAt={issue.createdAt}
                username={issue.user.username}
                image={issue.user.image}
              />
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
                  <Button
                    onClick={handleIssueDelete}
                    disabled={submitting}
                    startIcon={<DeleteIcon />}
                  >
                    Delete issue
                  </Button>
                </ListItem>
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
