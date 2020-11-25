import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardHeader,
  Avatar,
  IconButton,
  CardContent,
  Typography,
} from '@material-ui/core';
import { MoreHoriz as MoreHorizIcon } from '@material-ui/icons';
import { formatDistanceToNow } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
  },
}));

export default function IssueComment({ issue }) {
  const classes = useStyles();

  const formatDate = (date) =>
    formatDistanceToNow(new Date(date), { addSuffix: true });

  return (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={<Avatar src={issue.user.image} aria-label="user image" />}
        action={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <IconButton aria-label="settings">
            <MoreHorizIcon />
          </IconButton>
        }
        title={`${issue.user.username} commented 
            ${formatDate(issue.createdAt)}`}
      />
      <CardContent>
        <Typography paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {issue.body ? issue.body : 'No description provided.'}
        </Typography>
      </CardContent>
    </Card>
  );
}
