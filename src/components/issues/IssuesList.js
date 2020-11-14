import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, List, Divider } from '@material-ui/core';
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

  return (
    <div className={classes.root}>
      <Paper variant="outlined">
        <List
          disablePadding
          subheader={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <IssuesListSubHeader
              repository={repository}
              pathname={pathname}
              query={query}
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
    </div>
  );
}
