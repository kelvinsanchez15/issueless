import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Typography,
  Button,
  Avatar,
  Snackbar,
  CircularProgress,
} from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';

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
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submitWrapper: {
    margin: theme.spacing(1, 0, 2),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function LoginPage() {
  const classes = useStyles();
  const router = useRouter();
  const [errorAlert, setErrorAlert] = React.useState(false);

  return (
    <>
      <Head>
        <title>Welcome</title>
      </Head>

      <Container maxWidth="xs" component="main">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            One more step
          </Typography>
          <Typography component="h1" variant="h5">
            Create a username
          </Typography>

          <Formik
            initialValues={{ username: '' }}
            validationSchema={Yup.object({
              username: Yup.string().trim().strict(true).required('Required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              setErrorAlert(false);
              try {
                const { username } = values;
                const res = await fetch('/api/user', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username }),
                });
                if (!res.ok) {
                  setSubmitting(false);
                  const { error } = await res.json();
                  throw new Error(error);
                }
                await getSession();
                router.replace(`/${username}`);
                setSubmitting(false);
              } catch (error) {
                setErrorAlert(true);
              }
            }}
          >
            {({ handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit} className={classes.form}>
                <Field
                  component={TextField}
                  fullWidth
                  variant="outlined"
                  name="username"
                  type="username"
                  label="Username *"
                  autoComplete="username"
                  helperText=" "
                />

                <div className={classes.submitWrapper}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <Snackbar open={errorAlert}>
          <Alert severity="error">
            Username has already been used. Try again!
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
