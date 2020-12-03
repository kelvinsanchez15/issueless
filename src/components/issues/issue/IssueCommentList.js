import { useRouter } from 'next/router';
import useSWR from 'swr';
import fetcher from 'src/utils/fetcher';
import IssueComment from 'src/components/issues/issue/IssueComment';
import { StepConnector, Divider } from '@material-ui/core';

export default function IssueCommentList() {
  const router = useRouter();
  const { owner, repo: repoName, issue_number: issueNumber } = router.query;
  const url = `/api/repos/${owner}/${repoName}/issues/${issueNumber}/comments`;
  const { data: comments } = useSWR(url, fetcher);

  return (
    <>
      {comments?.map((comment) => (
        <div key={comment.id}>
          <IssueComment
            commentId={comment.id}
            body={comment.body}
            createdAt={comment.createdAt}
            username={comment.user.username}
            image={comment.user.image}
          />
          <StepConnector orientation="vertical" />
        </div>
      ))}
      <Divider />
    </>
  );
}
