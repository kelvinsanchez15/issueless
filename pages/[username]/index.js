import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Button, Grid } from '@material-ui/core';
import { BookOutlined as RepoIcon } from '@material-ui/icons';
import { PrismaClient } from '@prisma/client';
import UserProfile from 'src/components/UserProfile';
import ReposList from 'src/components/ReposList';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  avatar: {
    width: 'auto',
    height: 'auto',
  },
  tempWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const prisma = new PrismaClient();

export async function getServerSideProps({ query: { username } }) {
  const user = await prisma.user.findOne({
    where: { username },
    select: {
      image: true,
      name: true,
      username: true,
      bio: true,
      repositories: {
        select: { id: true, name: true, description: true, createdAt: true },
      },
    },
  });
  if (!user) {
    return { notFound: true };
  }
  // Parse dates to avoid serializable error
  user.repositories = user.repositories.map((repository) => {
    const createdAt = repository.createdAt.toISOString();
    return { ...repository, createdAt };
  });
  return {
    props: { username, user },
  };
}

export default function User({ username, user }) {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>{`${user.username}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <UserProfile user={user} />
          </Grid>
          <Grid item xs={9}>
            <div className={classes.tempWrapper}>
              <Button
                startIcon={<RepoIcon />}
                color="secondary"
                variant="contained"
              >
                New
              </Button>
            </div>
            <ReposList repos={user.repositories} username={username} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
