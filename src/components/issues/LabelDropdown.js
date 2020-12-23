import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Menu, MenuItem, Typography } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';
import Link from 'src/components/Link';

const labels = [
  {
    name: 'bug',
    color: 'd73a4a',
    description: "Something isn't working",
  },
  {
    name: 'documentation',
    color: '0075ca',
    description: 'Improvements or additions to documentation',
  },
  {
    name: 'duplicate',
    color: 'cfd3d7',
    description: 'This issue or pull request already exists',
  },
  {
    name: 'enhancement',
    color: 'a2eeef',
    description: 'New feature or request',
  },
  {
    name: 'good first issue',
    color: '7057ff',
    description: 'Good for newcomers',
  },
  {
    name: 'help wanted',
    color: '008672',
    description: 'Extra attention is needed',
  },
  {
    name: 'invalid',
    color: 'e4e669',
    description: "This doesn't seem right",
  },
  {
    name: 'question',
    color: 'd876e3',
    description: 'Further information is requested',
  },
  {
    name: 'wontfix',
    color: 'ffffff',
    description: 'This will not be worked on',
  },
];

const useStyles = makeStyles((theme) => ({
  menu: {
    maxHeight: 400,
  },
  labelColor: {
    width: '1em',
    height: '1em',
    borderRadius: '2em',
    marginRight: theme.spacing(1),
  },
}));

export default function LabelDropdown({ pathname, query }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  return (
    <>
      <Button
        aria-label="Filter by label"
        aria-controls="filter-issues-by-label"
        aria-haspopup="true"
        title="Label"
        onClick={handleMenuOpen}
        endIcon={<ArrowDropDownIcon />}
      >
        Label
      </Button>
      <Menu
        className={classes.menu}
        id="filter-issues-by-label"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {labels.map((label) => (
          <MenuItem
            key={label.name}
            component={Link}
            href={{
              pathname,
              query: { ...query, label: label.name },
            }}
            onClick={handleMenuClose}
            selected={query.label === label.name}
            color="inherit"
            naked
          >
            <span
              className={classes.labelColor}
              style={{ backgroundColor: `#${label.color}` }}
            />
            <div>
              <Typography variant="subtitle2">{label.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {label.description}
              </Typography>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
