import React from 'react';
import Image from 'next/image';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
  Hidden,
} from '@material-ui/core';
import Link from 'src/components/Link';
import {
  BugReport as BugReportIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as ExploreIcon,
  PlayArrow as DemoIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@material-ui/icons';
import { signOut, useSession } from 'next-auth/client';
import NavigationDrawer from 'src/components/layout/NavigationDrawer';

const useStyles = makeStyles((theme) => ({
  logo: {
    color: theme.palette.common.white,
    marginRight: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
  },
  navItem: {
    marginLeft: theme.spacing(2),
    color: theme.palette.common.black,
    '&:hover': {
      textDecoration: 'none',
    },
  },
  avatarSize: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  menuHeader: {
    display: 'block',
  },
  mr1: {
    marginRight: theme.spacing(1),
  },
}));

export default function Navbar() {
  const classes = useStyles();
  const [session] = useSession();

  const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (e) => setProfileAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { link: '/', name: 'HOME', icon: <HomeIcon /> },
    { link: '/explore', name: 'EXPLORE', icon: <ExploreIcon /> },
    { link: '/nrowlson0/akingman0/issues', name: 'DEMO', icon: <DemoIcon /> },
  ];

  return (
    <nav>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton
            className={classes.logo}
            edge="start"
            href="/"
            component={Link}
          >
            <BugReportIcon />
          </IconButton>

          <div className={classes.grow}>
            <Hidden smDown>
              {menuItems.map((item) => (
                <Button
                  className={classes.mr1}
                  key={item.name}
                  href={item.link}
                  component={Link}
                  variant="text"
                  naked
                >
                  {item.name}
                </Button>
              ))}
            </Hidden>
          </div>

          {!session ? (
            <Button
              className={classes.mr1}
              component={Link}
              variant="contained"
              color="primary"
              href="/signin"
              naked
            >
              Sign in
            </Button>
          ) : (
            <Hidden smDown implementation="css">
              <IconButton
                title="Create new repository"
                aria-label="create new repository"
                color="inherit"
                href="/new"
                component={Link}
                naked
              >
                <AddIcon />
              </IconButton>

              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar className={classes.avatarSize}>
                  <Image
                    src={session.user.image}
                    width={24}
                    height={24}
                    priority
                  />
                </Avatar>
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
                  href={`/${session.username}`}
                  component={Link}
                  naked
                  onClick={handleProfileMenuClose}
                >
                  <div>Signed in as</div>
                  <div>
                    <strong>{session.username}</strong>
                  </div>
                </MenuItem>
                <Divider />
                <MenuItem
                  href={`/${session.username}`}
                  component={Link}
                  naked
                  onClick={handleProfileMenuClose}
                >
                  Your profile
                </MenuItem>
                <MenuItem onClick={handleProfileMenuClose}>Your stars</MenuItem>
                <Divider />
                <MenuItem
                  href="/settings"
                  component={Link}
                  naked
                  onClick={handleProfileMenuClose}
                >
                  Settings
                </MenuItem>
                <MenuItem onClick={() => signOut()}>Sign out</MenuItem>
              </Menu>
            </Hidden>
          )}

          <Hidden mdUp implementation="css">
            <IconButton
              onClick={handleDrawerToggle}
              aria-label="Open Navigation"
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
        </Toolbar>
      </AppBar>

      <NavigationDrawer
        session={session}
        menuItems={menuItems}
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />
    </nav>
  );
}
