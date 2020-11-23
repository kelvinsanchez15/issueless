import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Button,
  TextField,
} from '@material-ui/core';
import { CheckCircleOutline as ClosedIssueIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  cardHeader: {
    backgroundColor: theme.palette.grey.A400,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
}));

export default function NewComment() {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        avatar={<Avatar src="" aria-label="user image" />}
        title="Here is going to be a comment toolbar"
      />
      <CardContent>
        <TextField
          fullWidth
          label="Comment"
          multiline
          rows={4}
          placeholder="Leave a comment"
          variant="outlined"
        />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button
          variant="outlined"
          startIcon={<ClosedIssueIcon color="error" />}
        >
          Close issue
        </Button>
        {/* {issue.state === 'open' ? (
        <Button
          variant="outlined"
          startIcon={<ClosedIssueIcon color="error" />}
        >
          Close issue
        </Button>
      ) : (
        <Button variant="outlined">Reopen issue</Button>
      )} */}
        <Button variant="contained" color="secondary">
          Comment
        </Button>
      </CardActions>
    </Card>
  );
}
