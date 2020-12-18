import { makeStyles } from '@material-ui/core/styles';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Drawer,
  IconButton,
  Divider,
} from '@material-ui/core';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from '@material-ui/icons';
import Link from 'src/components/Link';
import { signOut } from 'next-auth/client';

const useStyles = makeStyles((theme) => ({
  drawerHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  listItemIcon: {
    minWidth: '56px',
  },
  avatarSize: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

export default function NavigationDrawer({
  session,
  menuItems,
  anchor,
  open,
  onClose,
}) {
  const classes = useStyles();

  return (
    <Drawer variant="temporary" anchor={anchor} open={open} onClose={onClose}>
      <div className={classes.drawerHeader}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <List>
        {menuItems.map((item) => {
          return (
            <ListItem
              button
              onClick={onClose}
              key={item.name}
              href={item.link}
              component={Link}
              naked
            >
              <ListItemIcon className={classes.listItemIcon}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          );
        })}

        {session && (
          <>
            <Divider />
            <ListItem
              button
              onClick={onClose}
              href={`/${session.username}`}
              component={Link}
              naked
            >
              <ListItemAvatar>
                <Avatar
                  className={classes.avatarSize}
                  src={session.user.image || ''}
                />
              </ListItemAvatar>
              <ListItemText primary="PROFILE" />
            </ListItem>

            <ListItem
              button
              onClick={onClose}
              href="/settings"
              component={Link}
              naked
            >
              <ListItemIcon className={classes.listItemIcon}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="SETTINGS" />
            </ListItem>

            <ListItem button onClick={() => signOut()}>
              <ListItemIcon className={classes.listItemIcon}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="SIGN OUT" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );
}
