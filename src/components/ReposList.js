import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  List,
  Divider,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import Link from 'src/components/Link';
import formatDate from 'src/utils/formatDate';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  fallbackHeader: {
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
}));

export default function ReposList({ repos, username }) {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <List disablePadding>
        <Divider />
        {repos.length > 0 ? (
          repos.map((repo) => (
            <ListItem key={repo.id} divider>
              <ListItemText disableTypography>
                <Typography variant="h6">
                  <Link href={`/${username}/${repo.name}/issues`}>
                    {repo.name}
                  </Link>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {repo.description}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {`Created ${formatDate(repo.createdAt)}`}
                </Typography>
              </ListItemText>
            </ListItem>
          ))
        ) : (
          <Typography className={classes.fallbackHeader} variant="h6">
            {`${username} doesn’t have any public repositories yet.`}
          </Typography>
        )}
      </List>
    </Paper>
  );
}
