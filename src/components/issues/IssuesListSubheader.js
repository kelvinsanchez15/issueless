import { makeStyles } from '@material-ui/core/styles';
import { ListSubheader, Button } from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@material-ui/icons';
import Link from 'src/components/Link';
import SortDropdown from 'src/components/issues/SortDropdown';
import AuthorDropdown from 'src/components/issues/AuthorDropdown';
import AssigneeDropdown from 'src/components/issues/AssigneeDropdown';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

export default function IssuesListSubHeader({ repository, pathname, query }) {
  const classes = useStyles();
  return (
    <ListSubheader component="div" className={classes.root} inset disableSticky>
      <div>
        <Button
          href={{
            pathname,
            query: { ...query, state: 'open' },
          }}
          component={Link}
          style={{ textDecoration: 'none' }}
          startIcon={<OpenIssueIcon />}
        >
          {`${repository.openIssuesCount} Open`}
        </Button>
        <Button
          href={{
            pathname,
            query: { ...query, state: 'closed' },
          }}
          component={Link}
          style={{ textDecoration: 'none' }}
          startIcon={<ClosedIssueIcon />}
        >
          {`${repository.closedIssuesCount} Closed`}
        </Button>
      </div>
      <div>
        <AuthorDropdown pathname={pathname} query={query} />
        <Button endIcon={<ArrowDropDownIcon />}>Label</Button>
        <AssigneeDropdown pathname={pathname} query={query} />
        <SortDropdown pathname={pathname} query={query} />
      </div>
    </ListSubheader>
  );
}
