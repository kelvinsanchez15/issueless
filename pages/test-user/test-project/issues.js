import Head from 'next/head';
import IssuesList from 'src/components/IssuesList';
import fccIssues from 'src/utils/fcc-issues-api-response.json';

export default function Issues() {
  return (
    <>
      <Head>
        <title>Issues · test-user/test-project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <IssuesList issues={fccIssues} />
    </>
  );
}
