import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { Provider } from 'next-auth/client';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { LinearProgress } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from 'src/components/styles/theme';
import Navbar from 'src/components/layout/Navbar';
import useRouterLoading from 'src/hooks/useRouterLoading';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    height: '100vh',
  },
}));

export default function MyApp({ Component, pageProps }) {
  const classes = useStyles();
  const loading = useRouterLoading();

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Provider session={pageProps.session}>
          <CssBaseline />
          {loading && (
            <LinearProgress style={{ position: 'fixed', width: '100%' }} />
          )}
          <div className={classes.root}>
            <Navbar {...pageProps} />
            <Component {...pageProps} />
          </div>
        </Provider>
      </ThemeProvider>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  pageProps: PropTypes.object.isRequired,
};
