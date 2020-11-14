import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Divider,
} from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
  Comment as CommentIcon,
} from '@material-ui/icons';
import { Pagination, PaginationItem } from '@material-ui/lab';
import { formatDistanceToNow } from 'date-fns';
import Link from 'src/components/Link';
import IssuesListSubHeader from './IssuesListSubheader';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
  },
  listItemText: {
    '& > *': {
      marginRight: theme.spacing(0.5),
    },
  },
  labels: {
    '& > *': {
      marginRight: theme.spacing(0.5),
    },
  },
  issueLink: {
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
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

  // Helper functions
  const formatDate = (date) =>
    formatDistanceToNow(new Date(date), { addSuffix: true });

  const getContrastYIQ = (hexColor) => {
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  };

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
          {repository.issues.map((issue) => (
            <ListItem key={issue.id} divider>
              <ListItemIcon>
                {issue.state === 'open' ? (
                  <OpenIssueIcon color="secondary" titleAccess="Open issue" />
                ) : (
                  <ClosedIssueIcon color="error" titleAccess="Clossed issue" />
                )}
              </ListItemIcon>
              <ListItemText className={classes.listItemText} disableTypography>
                <Typography variant="body1" display="inline">
                  <Link
                    className={classes.issueLink}
                    href={{
                      pathname: `${pathname}/[issue]`,
                      query: {
                        username: query.username,
                        repo: query.repo,
                        issue: issue.number,
                      },
                    }}
                  >
                    {issue.title}
                  </Link>
                </Typography>
                <span className={classes.labels}>
                  {issue.labels.map((label) => (
                    <Chip
                      key={label.id}
                      label={label.name}
                      title={label.description}
                      size="small"
                      style={{
                        backgroundColor: `#${label.color}`,
                        color: getContrastYIQ(label.color),
                      }}
                    />
                  ))}
                </span>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  display="block"
                >
                  {issue.state === 'open'
                    ? `#${issue.number} 
                    opened ${formatDate(issue.createdAt)} 
                    by ${issue.user.username}`
                    : `#${issue.number} 
                    by ${issue.user.username} 
                    was closed ${formatDate(issue.closedAt)}`}
                </Typography>
              </ListItemText>
              <ListItemSecondaryAction>
                {issue.comments > 0 && (
                  <IconButton aria-label="comments">
                    <Badge badgeContent={issue.comments} color="primary">
                      <CommentIcon />
                    </Badge>
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
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
