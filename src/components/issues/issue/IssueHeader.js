import { useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  Chip,
  Divider,
  Snackbar,
  Hidden,
} from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
} from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import Link from 'src/components/Link';
import formatDate from 'src/utils/formatDate';
import getLabelStyle from 'src/utils/getLabelStyle';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';
import fetcher from 'src/utils/fetcher';

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
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      '& > *': {
        marginBottom: theme.spacing(1),
      },
    },
  },
  headerActions: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1),
    },
  },
  mr1: {
    marginRight: theme.spacing(1),
  },
  labels: {
    margin: theme.spacing(1, 0),
    '& > *': {
      margin: theme.spacing(0, 0.5, 0.5, 0),
    },
  },
  form: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      '& > *': {
        marginBottom: theme.spacing(1),
      },
    },
  },
  field: {
    flex: 'auto',
    [theme.breakpoints.up('md')]: {
      '& > div': {
        marginRight: theme.spacing(2),
      },
    },
  },
}));

export default function IssueHeader({
  title,
  number,
  state,
  labels,
  createdAt,
  issueAuthor,
}) {
  const classes = useStyles();
  const router = useRouter();
  const { owner, repo: repoName, issue_number: issueNumber } = router.query;
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  const [showHeader, setShowHeader] = useState(true);
  const { mutate } = useSWR(
    `/api/repos/${owner}/${repoName}/issues/${issueNumber}`,
    fetcher
  );
  const [session] = useSession();
  const userHasValidSession = Boolean(session);
  const isIssueAuthorOrRepoOwner =
    session?.username === issueAuthor || session?.username === owner;

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
            {userHasValidSession && isIssueAuthorOrRepoOwner && (
              <Button
                className={classes.mr1}
                variant="outlined"
                onClick={() => setShowHeader(false)}
              >
                Edit
              </Button>
            )}
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
                    className={classes.mr1}
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
        <strong>{issueAuthor}</strong>
        {` opened this issue ${formatDate(createdAt)}`}
      </Typography>

      <Snackbar open={errorAlert.open} autoHideDuration={300}>
        <Alert severity="error">{errorAlert.message}</Alert>
      </Snackbar>

      <Hidden mdUp implementation="css">
        <div className={classes.labels}>
          {labels.map((label) => (
            <Chip
              key={label.id}
              label={label.name}
              title={label.description}
              size="small"
              variant="outlined"
              style={getLabelStyle(label.color)}
            />
          ))}
        </div>
      </Hidden>

      <Divider />
    </div>
  );
}
