import React from 'react';
import Head from 'next/head';
import { providers, signIn } from 'next-auth/client';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Typography,
  Button,
  Avatar,
  SvgIcon,
} from '@material-ui/core';
import {
  LockOutlined as LockOutlinedIcon,
  GitHub as GitHubIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  wrapper: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
}));

function GoogleIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
    </SvgIcon>
  );
}

export default function SignIn({ providerList }) {
  const classes = useStyles();

  const providerIcons = { GitHub: <GitHubIcon />, Google: <GoogleIcon /> };

  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>

      <Container maxWidth="xs" component="main">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            Sign in
          </Typography>

          {Object.values(providerList).map((provider) => (
            <div className={classes.wrapper} key={provider.name}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={providerIcons[provider.name]}
                onClick={() => signIn(provider.id)}
              >
                {`Sign in with ${provider.name}`}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

SignIn.getInitialProps = async (context) => ({
  providerList: await providers(context),
});
