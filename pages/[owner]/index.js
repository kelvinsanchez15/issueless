import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Button, Grid, Typography } from '@material-ui/core';
import { BookOutlined as RepoIcon } from '@material-ui/icons';
import prisma from 'src/utils/db/prisma';
import Link from 'src/components/Link';
import UserProfile from 'src/components/UserProfile';
import ReposList from 'src/components/ReposList';
import { useSession } from 'next-auth/client';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    flexGrow: 1,
  },
}));

export async function getStaticPaths() {
  try {
    const users = await prisma.user.findMany({
      select: { username: true },
    });
    const paths = users.map((user) => ({
      params: { owner: user.username },
    }));
    return {
      paths,
      fallback: 'blocking',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getStaticProps({ params: { owner } }) {
  try {
    const user = await prisma.user.findOne({
      where: { username: owner },
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
    // Parse dates to avoid serializable error
    if (user) {
      user.repositories = user.repositories.map((repository) => {
        const createdAt = repository.createdAt.toISOString();
        return { ...repository, createdAt };
      });
    }
    return {
      props: { user },
      revalidate: 2,
      notFound: !user,
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function User({ user }) {
  const classes = useStyles();
  const [session] = useSession();
  const userHasValidSession = Boolean(session);
  const isRepoOwner = session?.username === user.username;

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
            <div className={classes.wrapper}>
              <Typography className={classes.title} variant="h5">
                Repositories:
              </Typography>
              {userHasValidSession && isRepoOwner && (
                <Button
                  startIcon={<RepoIcon />}
                  color="secondary"
                  variant="contained"
                  href="/new"
                  component={Link}
                  naked
                >
                  New
                </Button>
              )}
            </div>
            <ReposList repos={user.repositories} username={user.username} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
