import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';
import Hero from 'src/components/home/Hero';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
}));

export default function Home() {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>Issueless</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Hero />
      </Container>
    </>
  );
}
