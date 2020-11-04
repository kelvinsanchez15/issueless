import Head from 'next/head';
import Link from 'src/components/Link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Issueless</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>THIS IS MY HOME PAGE</div>
      <Link href="/test-user/test-project/issues">ISSUES</Link>
    </>
  );
}
