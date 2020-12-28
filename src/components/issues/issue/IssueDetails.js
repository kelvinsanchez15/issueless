import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardHeader,
  Avatar,
  IconButton,
  CardContent,
  Typography,
  CardActions,
  Button,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Edit as EditIcon } from '@material-ui/icons';
import formatDate from 'src/utils/formatDate';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';
import fetcher from 'src/utils/fetcher';
import Markdown from 'src/components/Markdown';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
    padding: theme.spacing(1, 2),
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
}));

export default function IssueDetails({
  body = 'No description provided.',
  createdAt,
  issueAuthor,
  image,
}) {
  const classes = useStyles();
  const router = useRouter();
  const { owner, repo: repoName, issue_number: issueNumber } = router.query;
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const [showComment, setShowComment] = useState(true);
  const [session] = useSession();
  const userHasValidSession = Boolean(session);
  const isIssueAuthorOrRepoOwner =
    session?.username === issueAuthor || session?.username === owner;
  const { mutate } = useSWR(
    `/api/repos/${owner}/${repoName}/issues/${issueNumber}`,
    fetcher
  );
  return (
    <>
      <Card>
        {showComment ? (
          <>
            <CardHeader
              className={classes.cardHeader}
              avatar={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Avatar className={classes.avatar} aria-label="user image">
                  <Image src={image} width={32} height={32} priority />
                </Avatar>
              }
              action={
                userHasValidSession &&
                isIssueAuthorOrRepoOwner && (
                  <IconButton
                    onClick={() => setShowComment(false)}
                    aria-label="settings"
                    title="Edit comment"
                  >
                    <EditIcon />
                  </IconButton>
                )
              }
              title={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Typography>
                  <strong>{issueAuthor}</strong>
                  {` commented ${formatDate(createdAt)}`}
                </Typography>
              }
            />
            <CardContent>
              <Markdown content={body} />
            </CardContent>
          </>
        ) : (
          <>
            <Formik
              initialValues={{ body }}
              validationSchema={Yup.object({
                body: Yup.string(),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                setErrorAlert({ ...errorAlert, open: false });
                try {
                  const res = await fetch(
                    `/api/repos/${owner}/${repoName}/issues/${issueNumber}`,
                    {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ body: values.body }),
                    }
                  );
                  setSubmitting(false);
                  if (!res.ok) {
                    const { message } = await res.json();
                    throw new Error(message);
                  }
                  setShowComment(true);
                  mutate();
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
                  <CardHeader
                    className={classes.cardHeader}
                    avatar={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Avatar aria-label="user image">
                        <Image src={image} width={40} height={40} />
                      </Avatar>
                    }
                    title="Make your changes below"
                  />
                  <CardContent>
                    <Field
                      className={classes.field}
                      component={TextField}
                      variant="outlined"
                      name="body"
                      autoFocus
                      size="small"
                      multiline
                      rows={4}
                      rowsMax={17}
                      fullWidth
                      inputProps={{
                        autoComplete: 'off',
                      }}
                    />
                  </CardContent>
                  <CardActions className={classes.cardActions}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowComment(true)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Update comment
                    </Button>
                  </CardActions>
                </Form>
              )}
            </Formik>
          </>
        )}
      </Card>

      <Snackbar open={errorAlert.open} autoHideDuration={300}>
        <Alert severity="error">{errorAlert.message}</Alert>
      </Snackbar>
    </>
  );
}
