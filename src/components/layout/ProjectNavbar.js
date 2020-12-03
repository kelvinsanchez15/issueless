import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  ButtonGroup,
  Button,
} from '@material-ui/core';
import Link from 'src/components/Link';
import {
  BookOutlined as RepoIcon,
  VisibilityOutlined as WatchIcon,
  ArrowDropDown as ArrowDropDownIcon,
  StarBorderOutlined as StarIcon,
  SettingsOutlined as SettingsIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  ml1: {
    marginLeft: theme.spacing(1),
  },
  boldLink: {
    fontWeight: '500',
  },
}));

export default function ProjectNavbar({ owner, repoName }) {
  const classes = useStyles();
  return (
    <nav>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5">
            <RepoIcon />
            <Link className={classes.ml1} href={`/${owner}`}>
              {owner}
            </Link>
            {' / '}
            <Link
              className={classes.boldLink}
              href={`/${owner}/${repoName}/issues`}
            >
              {repoName}
            </Link>
          </Typography>
          <div className={classes.grow} />
          <div>
            <ButtonGroup className={classes.ml1}>
              <Button startIcon={<WatchIcon />} endIcon={<ArrowDropDownIcon />}>
                Watch
              </Button>
              <Button>8.4k</Button>
            </ButtonGroup>
            <ButtonGroup className={classes.ml1}>
              <Button startIcon={<StarIcon />}>Star</Button>
              <Button>316,419</Button>
            </ButtonGroup>
            <ButtonGroup className={classes.ml1}>
              <Button startIcon={<SettingsIcon />}>Settings</Button>
            </ButtonGroup>
          </div>
        </Toolbar>
      </AppBar>
    </nav>
  );
}
