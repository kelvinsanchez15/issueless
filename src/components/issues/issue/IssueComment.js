import { useState } from 'react';
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
} from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
import formatDate from 'src/utils/formatDate';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';
import fetcher from 'src/utils/fetcher';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
}));

export default function IssueComment({
  commentId,
  body = 'No description provided.',
  createdAt,
  username,
  image,
}) {
  const classes = useStyles();
  const router = useRouter();
  const { username: owner, repo: repoName, issue: issueNumber } = router.query;
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const [showComment, setShowComment] = useState(true);
  const [session] = useSession();
  const userHasValidSession = Boolean(session);
  const isCommentOwnerOrRepoOwner =
    session?.username === username || session?.username === owner;

  const url = `/api/repos/${owner}/${repoName}/issues/${issueNumber}/comments`;
  const { mutate } = useSWR(url, fetcher);

  return (
    <>
      <Card>
        {showComment ? (
          <>
            <CardHeader
              className={classes.cardHeader}
              avatar={<Avatar src={image} aria-label="user image" />}
              action={
                userHasValidSession &&
                isCommentOwnerOrRepoOwner && (
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
                  <strong>{username}</strong>
                  {` commented ${formatDate(createdAt)}`}
                </Typography>
              }
            />
            <CardContent>
              <Typography paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {body}
              </Typography>
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
                    `/api/repos/${owner}/${repoName}/issues/${issueNumber}/comments/${commentId}`,
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
                    avatar={<Avatar src={image} aria-label="user image" />}
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
    </>
  );
}
