import { makeStyles, fade } from '@material-ui/core/styles';
import { Paper, Button, InputBase, Divider } from '@material-ui/core';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
} from '@material-ui/icons';

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
  return (
    <Paper className={classes.root} variant="outlined">
      <Button className={classes.filterButton} endIcon={<ArrowDropDownIcon />}>
        Filters
      </Button>

      <Divider orientation="vertical" />

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
