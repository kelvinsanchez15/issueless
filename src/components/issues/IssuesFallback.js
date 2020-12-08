import { makeStyles } from '@material-ui/core/styles';
import { Container, Typography } from '@material-ui/core';
import { ErrorOutlineOutlined as OpenIssueIcon } from '@material-ui/icons';
import { useRouter } from 'next/router';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  blankSlate: {
    padding: theme.spacing(10, 5),
  },
  header: {
    margin: theme.spacing(2, 0),
  },
}));

export default function IssuesFallback({ openIssuesCount, closedIssuesCount }) {
  const classes = useStyles();
  const router = useRouter();
  const { asPath } = router;
  return (
    <>
      <Container className={classes.root} maxWidth="md">
        <div className={classes.blankSlate}>
          <OpenIssueIcon fontSize="large" color="disabled" />

          {openIssuesCount === 0 && closedIssuesCount === 0 ? (
            <>
              <Typography className={classes.header} variant="h5">
                Welcome to issues!
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {`Issues are used to track todos, bugs, feature requests, and more.
              As issues are created, they’ll appear here in a searchable and
              filterable list. To get started, you should `}
                <Link href={`${asPath}/new`}>create an issue.</Link>
              </Typography>
            </>
          ) : (
            <Typography className={classes.header} variant="h5">
              No results matched your search.
            </Typography>
          )}
        </div>
      </Container>
    </>
  );
}
