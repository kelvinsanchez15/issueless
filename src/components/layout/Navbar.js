import React from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  Divider,
} from '@material-ui/core';
import Link from 'src/components/Link';
import {
  BugReport as BugReportIcon,
  Search as SearchIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  logo: {
    color: theme.palette.common.white,
  },
  navItem: {
    marginLeft: theme.spacing(2),
    color: theme.palette.common.black,
    '&:hover': {
      textDecoration: 'none',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
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
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  avatarSize: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  menuHeader: {
    display: 'block',
  },
}));

export default function Navbar() {
  const classes = useStyles();

  const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
  const [createAnchorEl, setCreateAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (e) => setProfileAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleCreateMenuOpen = (e) => setCreateAnchorEl(e.currentTarget);
  const handleCreateMenuClose = () => setCreateAnchorEl(null);

  return (
    <nav className={classes.grow}>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <IconButton
            className={classes.logo}
            edge="start"
            href="/"
            component={Link}
          >
            <BugReportIcon />
          </IconButton>

          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>

          <div className={classes.grow} />

          <IconButton aria-label="show 17 new notifications" color="inherit">
            <Badge badgeContent={17} color="secondary">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
          <IconButton
            edge="end"
            aria-label="create new..."
            aria-controls="create-new-menu"
            aria-haspopup="true"
            onClick={handleCreateMenuOpen}
            color="inherit"
          >
            <AddIcon />
            <ArrowDropDownIcon />
          </IconButton>
          <Menu
            id="create-new-menu"
            anchorEl={createAnchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            keepMounted
            open={Boolean(createAnchorEl)}
            onClose={handleCreateMenuClose}
          >
            <MenuItem onClick={handleCreateMenuClose}>New repository</MenuItem>
            <Divider />
            <MenuItem onClick={handleCreateMenuClose}>New Issue</MenuItem>
          </Menu>

          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar className={classes.avatarSize} />
            <ArrowDropDownIcon />
          </IconButton>
          <Menu
            id="primary-search-account-menu"
            anchorEl={profileAnchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            keepMounted
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem
              className={classes.menuHeader}
              onClick={handleProfileMenuClose}
            >
              <div>Signed in as</div>
              <div>
                <strong>test-user</strong>
              </div>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Your profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              Your repositories
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Your stars</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Sign out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </nav>
  );
}
