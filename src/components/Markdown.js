import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Link from '@material-ui/core/Link';
import {
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@material-ui/core';

const AtomDarkStyledCode = ({ language, value }) => (
  <SyntaxHighlighter style={atomDark} language={language}>
    {value}
  </SyntaxHighlighter>
);

const MuiLink = ({ href, children }) => (
  <Link href={href} target="_blank" rel="noopener">
    {children}
  </Link>
);

const MuiHeading = ({ children, level }) => {
  let variant;
  switch (level) {
    case 1:
      variant = 'h4';
      break;
    case 2:
      variant = 'h5';
      break;
    case 3:
      variant = 'h6';
      break;
    case 4:
      variant = 'subtitle1';
      break;
    case 5:
      variant = 'subtitle2';
      break;
    default:
      variant = 'body2';
      break;
  }
  return (
    <Typography gutterBottom variant={variant}>
      {children}
    </Typography>
  );
};

const MuiParagraph = ({ children }) => (
  <Typography variant="body2" gutterBottom>
    {children}
  </Typography>
);

const MuiTable = ({ children }) => (
  <TableContainer component={Paper}>
    <Table size="small" aria-label="a dense table">
      {children}
    </Table>
  </TableContainer>
);

const MuiTableCell = ({ children }) => (
  <TableCell>
    <Typography>{children}</Typography>
  </TableCell>
);

const MuiTableRow = ({ children }) => <TableRow>{children}</TableRow>;

const MuiTableBody = ({ children }) => <TableBody>{children}</TableBody>;

const MuiTableHead = ({ children }) => <TableHead>{children}</TableHead>;

const renderers = {
  code: AtomDarkStyledCode,
  link: MuiLink,
  heading: MuiHeading,
  paragraph: MuiParagraph,
  table: MuiTable,
  tableHead: MuiTableHead,
  tableBody: MuiTableBody,
  tableRow: MuiTableRow,
  tableCell: MuiTableCell,
};

export default function Markdown({ content }) {
  return (
    <ReactMarkdown renderers={renderers} plugins={[gfm]}>
      {content}
    </ReactMarkdown>
  );
}
