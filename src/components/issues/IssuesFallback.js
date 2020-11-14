export default function IssuesFallback({ openIssuesCount, closedIssuesCount }) {
  return (
    <>
      {openIssuesCount === 0 && closedIssuesCount === 0 ? (
        <>
          <div>Welcome to issues!</div>
          <p>
            Issues are used to track todos, bugs, feature requests, and more. As
            issues are created, they’ll appear here in a searchable and
            filterable list. To get started, you should create an issue.
          </p>
        </>
      ) : (
        <div>No results matched your search.</div>
      )}
    </>
  );
}
