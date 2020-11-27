import { useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, Chip, Divider, Snackbar } from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
} from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import Link from 'src/components/Link';
import formatDate from 'src/utils/formatDate';

const useStyles = makeStyles((theme) => ({
  openIssueChip: {
    marginRight: theme.spacing(0.5),
  },
  closedIssueChip: {
    marginRight: theme.spacing(0.5),
    backgroundColor: theme.palette.error.dark,
  },
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
  },
  headerShow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerActions: {
    '& > *': {
      marginLeft: theme.spacing(2),
    },
  },
  form: {
    display: 'flex',
  },
  field: {
    flex: 'auto',
  },
}));

export default function IssueHeader({
  title,
  number,
  state,
  createdAt,
  username,
}) {
  const classes = useStyles();
  const router = useRouter();
  const { username: owner, repo: repoName } = router.query;
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const [showHeader, setShowHeader] = useState(true);

  return (
    <div>
      {showHeader ? (
        <div className={classes.headerShow}>
          <Typography variant="h5">
            {title}
            <Typography variant="h5" component="span" color="textSecondary">
              {` #${number}`}
            </Typography>
          </Typography>
          <div className={classes.headerActions}>
            <Button variant="outlined" onClick={() => setShowHeader(false)}>
              Edit
            </Button>
            <Button
              color="secondary"
              variant="contained"
              component={Link}
              href={`/${owner}/${repoName}/issues/new`}
              naked
            >
              New Issue
            </Button>
          </div>
        </div>
      ) : (
        <div className={classes.headerEdit}>
          <Formik
            initialValues={{ title }}
            validationSchema={Yup.object({
              title: Yup.string().required('Required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              setErrorAlert({ ...errorAlert, open: false });
              try {
                const res = await fetch(
                  `/api/repos/${owner}/${repoName}/issues/${number}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: values.title }),
                  }
                );
                setSubmitting(false);
                if (!res.ok) {
                  const { message } = await res.json();
                  throw new Error(message);
                }
                setShowHeader(true);
                router.reload();
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
                  className={classes.field}
                  component={TextField}
                  variant="outlined"
                  name="title"
                  label="Title"
                  autoFocus
                  size="small"
                  inputProps={{
                    autoComplete: 'off',
                  }}
                />

                <div className={classes.headerActions}>
                  <Button
                    variant="contained"
                    color="secondary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowHeader(true)}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {state === 'open' ? (
          <Chip
            icon={<OpenIssueIcon titleAccess="Open issue" />}
            label="Open"
            color="secondary"
            className={classes.openIssueChip}
          />
        ) : (
          <Chip
            icon={<ClosedIssueIcon titleAccess="Clossed issue" />}
            label="Closed"
            className={classes.closedIssueChip}
          />
        )}
        <strong>{username}</strong>
        {` opened this issue ${formatDate(createdAt)}`}
      </Typography>

      <Snackbar open={errorAlert.open} autoHideDuration={300}>
        <Alert severity="error">{errorAlert.message}</Alert>
      </Snackbar>

      <Divider />
    </div>
  );
}
