import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, List, Divider } from '@material-ui/core';
import { Pagination, PaginationItem } from '@material-ui/lab';
import Link from 'src/components/Link';
import IssuesListSubHeader from './IssuesListSubheader';
import IssuesListItems from './IssuesListItems';
import IssuesFallback from './IssuesFallback';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      '& > *': {
        marginTop: theme.spacing(1),
      },
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
  paper: {
    [theme.breakpoints.down('xs')]: {
      borderLeftStyle: 'none',
      borderRightStyle: 'none',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    margin: theme.spacing(2, 0),
  },
}));

export default function IssuesList({ repository }) {
  const classes = useStyles();
  const router = useRouter();
  const { pathname, query } = router;
  const { page, ...queryWithoutPage } = query;

  return (
    <Container className={classes.root}>
      <Paper variant="outlined" className={classes.paper}>
        <List
          dense
          disablePadding
          subheader={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <IssuesListSubHeader
              pathname={pathname}
              query={queryWithoutPage}
              openIssuesCount={repository.openIssuesCount}
              closedIssuesCount={repository.closedIssuesCount}
            />
          }
        >
          <Divider />
          {repository.issues.length === 0 ? (
            <IssuesFallback
              openIssuesCount={repository.openIssuesCount}
              closedIssuesCount={repository.closedIssuesCount}
            />
          ) : (
            <IssuesListItems repository={repository} />
          )}
        </List>
      </Paper>
      <Pagination
        className={classes.pagination}
        page={Number(query.page) || 1}
        count={repository.totalPages}
        shape="rounded"
        renderItem={(item) => (
          <PaginationItem
            href={{
              pathname,
              query: {
                ...query,
                page: item.page,
              },
            }}
            component={Link}
            naked
            query={query}
            item={item}
            {...item}
          />
        )}
      />
    </Container>
  );
}
