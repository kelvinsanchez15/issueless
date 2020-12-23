import React from 'react';
import { useRouter } from 'next/router';
import { makeStyles, fade } from '@material-ui/core/styles';
import {
  Paper,
  Button,
  InputBase,
  Divider,
  Menu,
  MenuItem,
} from '@material-ui/core';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
} from '@material-ui/icons';
import { useSession } from 'next-auth/client';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  filterButton: {
    borderRadius: 0,
  },
  search: {
    position: 'relative',
    marginLeft: 0,
    width: 'auto',
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.1),
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 1),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export default function IssuesFilter() {
  const classes = useStyles();
  const [session] = useSession();
  const userHasValidSession = Boolean(session);
  const loggedUser = session?.username;
  const router = useRouter();
  const { owner, repo: repoName } = router.query;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  return (
    <Paper className={classes.root} variant="outlined">
      {userHasValidSession && (
        <>
          <Button
            className={classes.filterButton}
            aria-label="Sort by state"
            aria-controls="sort-issues-by-state"
            aria-haspopup="true"
            title="Filter"
            onClick={handleMenuOpen}
            endIcon={<ArrowDropDownIcon />}
          >
            Filters
          </Button>
          <Menu
            id="sort-issues-by-state"
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              component={Link}
              href={`/${owner}/${repoName}/issues?state=open`}
              onClick={handleMenuClose}
              color="inherit"
              naked
            >
              Open issues
            </MenuItem>
            <MenuItem
              component={Link}
              href={`/${owner}/${repoName}/issues?author=${loggedUser}`}
              onClick={handleMenuClose}
              color="inherit"
              naked
            >
              Your issues
            </MenuItem>
            <MenuItem
              component={Link}
              href={`/${owner}/${repoName}/issues?assignee=${loggedUser}`}
              onClick={handleMenuClose}
              color="inherit"
              naked
            >
              Assigned to you
            </MenuItem>
          </Menu>

          <Divider orientation="vertical" />
        </>
      )}

      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="Search all issues"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
      </div>
    </Paper>
  );
}
