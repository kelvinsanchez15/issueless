import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
import { BookOutlined as RepoIcon } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { useSession } from 'next-auth/client';

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

export default function NewRepository() {
  const classes = useStyles();
  const router = useRouter();
  const [session, loading] = useSession();
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });

  // if logged out, redirect to signin page
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/signin');
    }
  }, [session, loading, router]);

  return (
    <>
      <Head>
        <title>Create a new repository</title>
      </Head>

      <Container maxWidth="sm" component="main">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <RepoIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            Create a new repository
          </Typography>

          <Formik
            initialValues={{ name: '', description: '' }}
            validationSchema={Yup.object({
              name: Yup.string().trim().strict(true).required('Required'),
              description: Yup.string().trim().strict(true),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setErrorAlert({ ...errorAlert, open: false });
              const { name, description } = values;
              const body = {
                name,
                ...(description && { description }),
              };
              try {
                const res = await fetch('/api/repos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
                });
                setSubmitting(false);
                if (!res.ok) {
                  const { message } = await res.json();
                  throw new Error(message);
                }
                router.replace(`/${session.username}/${name}/issues`);
                resetForm();
              } catch (error) {
                setErrorAlert({
                  ...errorAlert,
                  open: true,
                  message: error.message,
                });
              }
            }}
          >
            {({ handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit} className={classes.form}>
                <Field
                  component={TextField}
                  fullWidth
                  variant="filled"
                  name="name"
                  label="Repository name *"
                  helperText=" "
                  autoFocus
                  inputProps={{
                    autoComplete: 'off',
                  }}
                />

                <Field
                  component={TextField}
                  fullWidth
                  variant="filled"
                  name="description"
                  label="Description (optional)"
                  helperText=" "
                  inputProps={{
                    autoComplete: 'off',
                  }}
                />

                <div className={classes.submitWrapper}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Create repository
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

        <Snackbar open={errorAlert.open} autoHideDuration={300}>
          <Alert severity="error">{errorAlert.message}</Alert>
        </Snackbar>
      </Container>
    </>
  );
}
