import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
} from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
  Comment as CommentIcon,
} from '@material-ui/icons';
import Link from 'src/components/Link';
import formatDate from 'src/utils/formatDate';
import getLabelStyle from 'src/utils/getLabelStyle';

const useStyles = makeStyles((theme) => ({
  ListItem: {
    [theme.breakpoints.down('xs')]: {
      paddingRight: theme.spacing(2),
    },
  },
  listItemIcon: {
    minWidth: theme.spacing(6),
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
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
  issueLink: {
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
    },
  },
  listItemSecondaryAction: {
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
}));

export default function IssuesListItems({ repository }) {
  const classes = useStyles();
  const router = useRouter();
  const { pathname, query } = router;

  return (
    <>
      {repository.issues.map((issue) => (
        <ListItem key={issue.id} divider className={classes.ListItem}>
          <ListItemIcon className={classes.listItemIcon}>
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
                  pathname: `${pathname}/[issue_number]`,
                  query: {
                    owner: query.owner,
                    repo: query.repo,
                    issue_number: issue.number,
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
                  variant="outlined"
                  style={getLabelStyle(label.color)}
                />
              ))}
            </span>
            <Typography variant="caption" color="textSecondary" display="block">
              {issue.state === 'open'
                ? `#${issue.number} 
              opened ${formatDate(issue.createdAt)} 
              by ${issue.user.username}`
                : `#${issue.number} 
              by ${issue.user.username} 
              was closed ${formatDate(issue.closedAt)}`}
            </Typography>
          </ListItemText>
          <ListItemSecondaryAction className={classes.listItemSecondaryAction}>
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
    </>
  );
}
