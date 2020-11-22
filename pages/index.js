import Head from 'next/head';
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

const prisma = new PrismaClient();

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

export async function getStaticProps() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, bio: true, image: true },
  });
  if (!users) return { notFound: true };
  return {
    props: { users },
    revalidate: 2,
  };
}

export default function Home({ users }) {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>Issueless</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Paper className={classes.root}>
          <List disablePadding>
            <Divider />
            {users.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemIcon>
                  <Avatar src={user.image} />
                </ListItemIcon>
                <ListItemText disableTypography>
                  <Typography variant="h6">
                    <Link href={`/${user.username}`}>{user.name}</Link>
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {user.username}
                  </Typography>
                  <Typography variant="body1">{user.bio}</Typography>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
}
