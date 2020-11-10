import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, Avatar } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: 'auto',
    height: 'auto',
  },
  cardNamesWrapper: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  cardBio: {
    marginBottom: theme.spacing(2),
  },
}));

export default function UserProfile({ user }) {
  const classes = useStyles();
  return (
    <>
      <Avatar alt={user.username} src={user.image} className={classes.avatar} />
      <div className={classes.cardNamesWrapper}>
        <Typography variant="h5">{user.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {user.username}
        </Typography>
      </div>
      <Typography className={classes.cardBio} variant="body1">
        {user.bio}
      </Typography>
      <Button variant="outlined" fullWidth>
        EDIT PROFILE
      </Button>
    </>
  );
}
