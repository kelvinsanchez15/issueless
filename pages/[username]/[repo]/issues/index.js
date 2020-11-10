import Head from 'next/head';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import IssuesList from 'src/components/IssuesList';
import IssuesFilter from 'src/components/IssuesFilter';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Button, Chip } from '@material-ui/core';
import { LocalOfferOutlined as LabelIcon } from '@material-ui/icons';
import { PrismaClient } from '@prisma/client';

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
  query: { username, repo: repoName },
}) {
  const owner = await prisma.user.findOne({
    where: { username },
    select: { id: true },
  });
  if (!owner) return { notFound: true };
  const repository = await prisma.repository.findOne({
    where: {
      repositories_name_owner_id_key: { name: repoName, ownerId: owner.id },
    },
    select: {
      id: true,
      name: true,
      issues: {
        include: {
          user: { select: { username: true, id: true, image: true } },
          labels: true,
        },
      },
    },
  });
  if (!repository) return { notFound: true };
  // Parse dates to avoid serializable error
  repository.issues = repository.issues.map((issue) => {
    const createdAt = issue.createdAt.toISOString();
    const updatedAt = issue.updatedAt.toISOString();
    return { ...issue, createdAt, updatedAt };
  });
  return {
    props: { repository, username, repoName },
  };
}

export default function Issues({ repository, username, repoName }) {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>{`Issues · ${username}/${repoName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProjectNavbar username={username} repoName={repoName} />
      <Container className={classes.root}>
        <div className={classes.filterAndButtons}>
          <IssuesFilter />
          <div className={classes.buttonsWraper}>
            <Button variant="outlined" startIcon={<LabelIcon />}>
              Labels
              <Chip className={classes.ml1} label={16} size="small" />
            </Button>
            <Button color="secondary" variant="contained">
              New Issue
            </Button>
          </div>
        </div>
        <IssuesList
          issues={repository.issues}
          username={username}
          repoName={repoName}
        />
      </Container>
    </>
  );
}
