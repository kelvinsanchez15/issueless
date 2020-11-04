import Head from 'next/head';
import ProjectNavbar from 'src/components/layout/ProjectNavbar';
import IssuesList from 'src/components/IssuesList';
import IssuesFilter from 'src/components/IssuesFilter';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Button, Chip } from '@material-ui/core';
import { LocalOfferOutlined as LabelIcon } from '@material-ui/icons';

import fccIssues from 'src/utils/fcc-issues-api-response.json';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  filterAndButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonsWraper: {
    '& > *': {
      marginLeft: theme.spacing(2),
    },
  },
  ml1: {
    marginLeft: theme.spacing(1),
  },
}));

export default function Issues() {
  const classes = useStyles();
  return (
    <>
      <Head>
        <title>Issues · test-user/test-project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProjectNavbar />
      <Container className={classes.root}>
        <div className={classes.filterAndButtons}>
          <IssuesFilter />
          <div className={classes.buttonsWraper}>
            <Button variant="outlined" startIcon={<LabelIcon />}>
              Labels
              <Chip className={classes.ml1} label={16} size="small" />
            </Button>
            <Button color="secondary" variant="contained">
              New Issue
            </Button>
          </div>
        </div>
        <IssuesList issues={fccIssues} />
      </Container>
    </>
  );
}
