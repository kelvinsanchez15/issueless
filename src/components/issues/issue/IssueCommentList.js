import IssueComment from 'src/components/issues/issue/IssueComment';
import { StepConnector, Divider } from '@material-ui/core';

export default function IssueCommentList({ comments }) {
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
