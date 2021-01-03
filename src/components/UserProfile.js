import Image from 'next/image';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, Avatar, Grid } from '@material-ui/core';

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
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function UserProfile({ user }) {
  const classes = useStyles();
  return (
    <>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={3} md={12}>
          <Avatar alt={user.username} className={classes.avatar}>
            <Image src={user.image} width={300} height={300} priority />
          </Avatar>
        </Grid>
        <Grid item xs={9} md={12}>
          <div className={classes.cardNamesWrapper}>
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user.username}
            </Typography>
          </div>
        </Grid>
      </Grid>

      <Typography className={classes.cardBio} variant="body1">
        {user.bio}
      </Typography>
      <Button variant="outlined" fullWidth>
        EDIT PROFILE
      </Button>
    </>
  );
}
