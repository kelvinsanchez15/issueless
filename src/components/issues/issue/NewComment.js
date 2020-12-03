import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Button,
} from '@material-ui/core';
import { CheckCircleOutline as ClosedIssueIcon } from '@material-ui/icons';
import fetcher from 'src/utils/fetcher';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
  },
  cardContent: {
    paddingBottom: 0,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
}));

export default function NewComment({ state, image }) {
  const classes = useStyles();
  const router = useRouter();
  const {
    username: owner,
    repo: repoName,
    issue_number: issueNumber,
  } = router.query;
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const url = `/api/repos/${owner}/${repoName}/issues/${issueNumber}/comments`;
  const { mutate } = useSWR(url, fetcher);
  return (
    <Card className={classes.root}>
      <Formik
        initialValues={{ body: '' }}
        validationSchema={Yup.object({
          body: Yup.string().required('Required'),
        })}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setErrorAlert({ ...errorAlert, open: false });
          try {
            const res = await fetch(
              `/api/repos/${owner}/${repoName}/issues/${issueNumber}/comments`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: values.body }),
              }
            );
            setSubmitting(false);
            if (!res.ok) {
              const { message } = await res.json();
              throw new Error(message);
            }
            resetForm();
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
        {({ handleSubmit, isSubmitting, isValid, dirty }) => (
          <Form onSubmit={handleSubmit} className={classes.form}>
            <CardHeader
              className={classes.cardHeader}
              avatar={<Avatar src={image} aria-label="user image" />}
              title="Write"
            />
            <CardContent className={classes.cardContent}>
              <Field
                component={TextField}
                variant="outlined"
                name="body"
                placeholder="Leave a comment"
                size="small"
                multiline
                rows={4}
                rowsMax={17}
                fullWidth
                inputProps={{
                  autoComplete: 'off',
                }}
                helperText=" "
              />
            </CardContent>

            <CardActions className={classes.cardActions}>
              {state === 'open' ? (
                <Button
                  variant="outlined"
                  startIcon={<ClosedIssueIcon color="error" />}
                >
                  Close issue
                </Button>
              ) : (
                <Button variant="outlined">Reopen issue</Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={!(isValid && dirty) || isSubmitting}
              >
                Comment
              </Button>
            </CardActions>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
