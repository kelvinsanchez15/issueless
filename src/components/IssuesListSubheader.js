import { makeStyles } from '@material-ui/core/styles';
import { ListSubheader, Button } from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@material-ui/icons';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

export default function IssuesListSubHeader() {
  const classes = useStyles();
  return (
    <ListSubheader component="div" className={classes.root} inset>
      <div>
        <Button startIcon={<OpenIssueIcon />}>301 Open</Button>
        <Button startIcon={<ClosedIssueIcon />}>39,345 Closed</Button>
      </div>
      <div>
        <Button endIcon={<ArrowDropDownIcon />}>Author</Button>
        <Button endIcon={<ArrowDropDownIcon />}>Label</Button>
        <Button endIcon={<ArrowDropDownIcon />}>Assignee</Button>
        <Button endIcon={<ArrowDropDownIcon />}>Sort</Button>
      </div>
    </ListSubheader>
  );
}
