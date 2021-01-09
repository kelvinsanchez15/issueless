import Head from 'next/head';
import Image from 'next/image';
import Link from 'src/components/Link';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Paper,
  List,
  Divider,
  ListItem,
  ListItemText,
  Typography,
  ListItemIcon,
  Avatar,
} from '@material-ui/core';
import { PrismaClient } from '@prisma/client';
import formatDate from 'src/utils/formatDate';

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

export async function getStaticProps() {
  try {
    let repos = await prisma.repository.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });
    if (!repos) return { notFound: true };
    // Parse dates to avoid serializable error
    repos = repos.map((repo) => {
      const createdAt = repo.createdAt.toISOString();
      return { ...repo, createdAt };
    });
    return {
      props: { repos },
      revalidate: 2,
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function Explore({ repos }) {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>Explore Issueless</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Paper className={classes.root}>
          <List disablePadding>
            <Divider />
            {repos.map((repo) => (
              <ListItem key={repo.id} divider>
                <ListItemIcon>
                  <Avatar>
                    <Image src={repo.user.image} width={40} height={40} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText disableTypography>
                  <Typography variant="h6">
                    <Link href={`/${repo.user.username}/${repo.name}/issues`}>
                      {repo.name}
                    </Link>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {repo.description}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {`Created by ${repo.user.username} 
                    ${formatDate(repo.createdAt)}`}
                  </Typography>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
}
