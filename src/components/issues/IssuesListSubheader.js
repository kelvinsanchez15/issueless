import { makeStyles } from '@material-ui/core/styles';
import { ListSubheader, Hidden } from '@material-ui/core';
import SortDropdown from 'src/components/issues/SortDropdown';
import AuthorDropdown from 'src/components/issues/AuthorDropdown';
import AssigneeDropdown from 'src/components/issues/AssigneeDropdown';
import LabelDropdown from './LabelDropdown';
import OpenClosedIssuesButton from './OpenClosedIssuesButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
    },
  },
  dropdowns: {
    [theme.breakpoints.down('xs')]: {
      '& > button > span > span': {
        display: 'none',
      },
    },
  },
}));

export default function IssuesListSubHeader({
  pathname,
  query,
  openIssuesCount,
  closedIssuesCount,
}) {
  const classes = useStyles();
  return (
    <ListSubheader component="div" className={classes.root} disableSticky>
      <Hidden smDown>
        <OpenClosedIssuesButton
          query={query}
          openIssuesCount={openIssuesCount}
          closedIssuesCount={closedIssuesCount}
        />
      </Hidden>

      <div className={classes.dropdowns}>
        <AuthorDropdown pathname={pathname} query={query} />
        <LabelDropdown pathname={pathname} query={query} />
        <AssigneeDropdown pathname={pathname} query={query} />
        <SortDropdown pathname={pathname} query={query} />
      </div>
    </ListSubheader>
  );
}
