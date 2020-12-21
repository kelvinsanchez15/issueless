import { Button } from '@material-ui/core';
import {
  ErrorOutlineOutlined as OpenIssueIcon,
  CheckCircleOutline as ClosedIssueIcon,
} from '@material-ui/icons';
import Link from 'src/components/Link';

export default function OpenClosedIssuesButton({
  query,
  openIssuesCount,
  closedIssuesCount,
}) {
  const { owner, repoName } = query;
  return (
    <div>
      <Button
        href={`/${owner}/${repoName}/issues?state=open`}
        component={Link}
        naked
        startIcon={<OpenIssueIcon />}
      >
        {`${openIssuesCount} Open`}
      </Button>
      <Button
        href={`/${owner}/${repoName}/issues?state=closed`}
        component={Link}
        naked
        startIcon={<ClosedIssueIcon />}
      >
        {`${closedIssuesCount} Closed`}
      </Button>
    </div>
  );
}
