import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Formik, Form, Field } from 'formik';
import { TextField, Select } from 'formik-material-ui';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Typography,
  Button,
  Avatar,
  Snackbar,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
} from '@material-ui/core';
import { ErrorOutlineOutlined as OpenIssueIcon } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';
import fetcher from 'src/utils/fetcher';
import getLabelStyle from 'src/utils/getLabelStyle';

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
  labels: {
    '& > *': {
      marginRight: theme.spacing(0.5),
    },
  },
  labelColor: {
    width: '1em',
    height: '1em',
    borderRadius: '2em',
    marginRight: theme.spacing(1),
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

export default function NewIssue() {
  const classes = useStyles();
  const router = useRouter();
  const { owner, repo: repoName } = router.query;
  const [session, loading] = useSession();
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const { data: labelsData } = useSWR(
    `/api/repos/${owner}/${repoName}/labels`,
    fetcher
  );

  // if logged out, redirect to signin page
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/signin');
    }
  }, [session, loading, router]);

  return (
    <>
      <Head>
        <title>{`New Issue · ${owner}/${repoName}`}</title>
      </Head>

      <Container maxWidth="sm" component="main">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <OpenIssueIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            Create new issue
          </Typography>

          <Formik
            initialValues={{ title: '', body: '', labels: [] }}
            validationSchema={Yup.object({
              title: Yup.string().trim().strict(true).required('Required'),
              body: Yup.string(),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setErrorAlert({ ...errorAlert, open: false });
              const { title, body, labels } = values;
              // Filter labels ids from array of objects
              const labelsIds = labels.map((label) => ({ id: label.id }));
              const data = {
                title,
                ...(body && { body }),
                labels: labelsIds,
              };
              try {
                const res = await fetch(
                  `/api/repos/${owner}/${repoName}/issues`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  }
                );
                setSubmitting(false);
                if (!res.ok) {
                  const { message } = await res.json();
                  throw new Error(message);
                }
                const { number } = await res.json();
                router.replace(`/${owner}/${repoName}/issues/${number}`);
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
                  name="title"
                  label="Title *"
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
                  name="body"
                  label="Details"
                  helperText=" "
                  multiline
                  rows={4}
                  placeholder="Leave a comment"
                />

                <FormControl variant="filled" fullWidth>
                  <InputLabel shrink htmlFor="labels">
                    Labels
                  </InputLabel>
                  <Field
                    component={Select}
                    type="text"
                    name="labels"
                    multiple
                    inputProps={{ name: 'labels', id: 'labels' }}
                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      getContentAnchorEl: null,
                      disableAutoFocusItem: true,
                    }}
                    renderValue={(selected) => (
                      <div className={classes.labels}>
                        {selected.map((label) => (
                          <Chip
                            key={label.name}
                            label={label.name}
                            size="small"
                            variant="outlined"
                            style={getLabelStyle(label.color)}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {labelsData?.map((label) => (
                      <MenuItem key={label.id} value={label}>
                        <span
                          className={classes.labelColor}
                          style={{ backgroundColor: `#${label.color}` }}
                        />
                        <div>
                          <Typography variant="subtitle2">
                            {label.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {label.description}
                          </Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Field>
                  <FormHelperText> </FormHelperText>
                </FormControl>

                <div className={classes.submitWrapper}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Create new issue
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
