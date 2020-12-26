import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Link from '@material-ui/core/Link';

const atomDarkStyledCode = ({ language, value }) => (
  <SyntaxHighlighter style={atomDark} language={language}>
    {value}
  </SyntaxHighlighter>
);

const muiLink = ({ href, children }) => (
  <Link href={href} target="_blank" rel="noopener">
    {children}
  </Link>
);

export default function Markdown({ content }) {
  return (
    <ReactMarkdown
      renderers={{ code: atomDarkStyledCode, link: muiLink }}
      plugins={[gfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
