import React from 'react';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';
import Link from 'src/components/Link';

const menuItems = [
  {
    text: 'Newest',
    sort: 'createdAt:desc',
  },
  {
    text: 'Oldest',
    sort: 'createdAt:asc',
  },
  {
    text: 'Recently updated',
    sort: 'updatedAt:desc',
  },
  {
    text: 'Least recently updated',
    sort: 'updatedAt:asc',
  },
];

export default function SortDropdown({ pathname, query }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  return (
    <>
      <Button
        aria-label="Sort by"
        aria-controls="sort-issues"
        aria-haspopup="true"
        title="Sort"
        onClick={handleMenuOpen}
        endIcon={<ArrowDropDownIcon />}
      >
        Sort
      </Button>
      <Menu
        id="sort-issues"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.text}
            component={Link}
            href={{
              pathname,
              query: { ...query, sort: item.sort },
            }}
            onClick={handleMenuClose}
            selected={query.sort === item.sort}
            color="inherit"
            naked
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
