import React from 'react';
import { makeStyles, fade } from '@material-ui/core/styles';
import {
  Button,
  Menu,
  MenuItem,
  InputBase,
  Typography,
} from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';
import { NextLinkComposed } from 'src/components/Link';

const useStyles = makeStyles((theme) => ({
  search: {
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    position: 'relative',
    width: '100%',
  },
  input: {
    padding: theme.spacing(1),
    width: '300px',
  },
  menuItem: {
    display: 'block',
    whiteSpace: 'nowrap',
    width: '300px',
  },
}));

export default function AuthorDropdown({ pathname, query }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [author, setAuthor] = React.useState('');
  const handleChange = (e) => setAuthor(e.target.value);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  return (
    <>
      <Button
        aria-label="Filter users by author"
        aria-controls="filter-users-by-author"
        aria-haspopup="true"
        title="Author"
        onClick={handleMenuOpen}
        endIcon={<ArrowDropDownIcon />}
      >
        Author
      </Button>
      <Menu
        id="filter-users-by-author"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{ disablePadding: true }}
      >
        <div className={classes.search}>
          <InputBase
            placeholder="Filter users"
            className={classes.input}
            inputProps={{ 'aria-label': 'Filter users', spellCheck: 'false' }}
            onChange={handleChange}
          />
        </div>

        {author && (
          <MenuItem
            className={classes.menuItem}
            component={NextLinkComposed}
            to={{
              pathname,
              query: { ...query, author },
            }}
            onClick={handleMenuClose}
            color="inherit"
          >
            <Typography variant="body1">{`author:${author}`}</Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Filter by this user
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
