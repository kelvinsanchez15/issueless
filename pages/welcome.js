import Head from 'next/head';
import Link from 'src/components/Link';

export default function Welcome() {
  return (
    <>
      <Head>
        <title>Welcome</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>Here is going to be the form for new user extra info</div>
      <Link href="/test-user/test-project/issues">ISSUES</Link>
    </>
  );
}
