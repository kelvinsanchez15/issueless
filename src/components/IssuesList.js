import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
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
import { formatDistanceToNow } from 'date-fns';
import IssuesListSubHeader from './IssuesListSubheader';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  ListSubheader: {
    display: 'flex',
    alignItems: 'center',
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
}));

export default function IssuesList({ issues }) {
  const classes = useStyles();

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
    <>
      <Container className={classes.root}>
        <Paper variant="outlined">
          <List subheader={<IssuesListSubHeader />}>
            <Divider />
            {issues.map((issue) => (
              <ListItem key={issue.id} divider>
                <ListItemIcon>
                  {issue.state === 'open' ? (
                    <OpenIssueIcon color="secondary" titleAccess="Open issue" />
                  ) : (
                    <ClosedIssueIcon
                      color="error"
                      titleAccess="Clossed issue"
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  className={classes.listItemText}
                  disableTypography
                >
                  <Typography variant="body1" display="inline">
                    {issue.title}
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
                    opened ${formatDate(issue.created_at)} 
                    by ${issue.user.login}`
                      : `#${issue.number} 
                    by ${issue.user.login} 
                    was closed ${formatDate(issue.closed_at)}`}
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
      </Container>
    </>
  );
}
