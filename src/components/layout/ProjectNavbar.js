import React from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  ButtonGroup,
  Button,
  Hidden,
  IconButton,
} from '@material-ui/core';
import Link from 'src/components/Link';
import {
  BookOutlined as RepoIcon,
  VisibilityOutlined as WatchIcon,
  ArrowDropDown as ArrowDropDownIcon,
  StarBorderOutlined as StarIcon,
  Star as StarFilledIcon,
  SettingsOutlined as SettingsIcon,
} from '@material-ui/icons';
import fetcher from 'src/utils/fetcher';
import { useSession } from 'next-auth/client';

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
  const router = useRouter();
  const [session] = useSession();
  const userHasValidSession = Boolean(session);
  const { data, mutate } = useSWR(
    `/api/repos/${owner}/${repoName}/stargazers`,
    fetcher
  );

  const handleClickStar = async () => {
    if (!userHasValidSession) {
      router.push('/signin');
      return;
    }
    const res = await fetch(`/api/repos/${owner}/${repoName}/stargazers`, {
      method: data?.starred ? 'DELETE' : 'PUT',
    });
    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message);
    }
    mutate();
  };

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
          <Hidden smDown>
            <div>
              <ButtonGroup className={classes.ml1}>
                <Button
                  startIcon={<WatchIcon />}
                  endIcon={<ArrowDropDownIcon />}
                >
                  Watch
                </Button>
                <Button>8.4k</Button>
              </ButtonGroup>
              <ButtonGroup className={classes.ml1}>
                <Button
                  onClick={handleClickStar}
                  startIcon={data?.starred ? <StarFilledIcon /> : <StarIcon />}
                  title={
                    userHasValidSession
                      ? `Star ${owner}/${repoName}`
                      : 'You must be signed in to star a repository'
                  }
                >
                  Star
                </Button>
                <Button>{0 || data?.stargazers_count}</Button>
              </ButtonGroup>
              <ButtonGroup className={classes.ml1}>
                <Button
                  startIcon={<SettingsIcon />}
                  component={Link}
                  href={`/${owner}/${repoName}/settings`}
                  naked
                >
                  Settings
                </Button>
              </ButtonGroup>
            </div>
          </Hidden>
          <Hidden mdUp>
            <IconButton
              component={Link}
              href={`/${owner}/${repoName}/settings`}
              naked
            >
              <SettingsIcon />
            </IconButton>
          </Hidden>
        </Toolbar>
      </AppBar>
    </nav>
  );
}
