import Image from 'next/image';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Button,
  Typography,
  Grid,
  Hidden,
} from '@material-ui/core/';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      minHeight: `calc(100vh - 64px)`,
    },
  },
  image: {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
  },
  mb8: {
    marginBottom: theme.spacing(8),
  },
  mr2: {
    marginRight: theme.spacing(2),
  },
}));

export default function Hero() {
  const classes = useStyles();
  return (
    <section id="home" className={classes.root}>
      <Container>
        <Grid container justify="space-between">
          <Grid item xs={12} md={6}>
            <div className={classes.mb8}>
              <Typography component="h1" variant="h2" gutterBottom>
                Issueless
              </Typography>

              <Typography
                component="p"
                variant="subtitle1"
                color="textSecondary"
              >
                JAMStack Issue Tracker inspired on GitHub issues.
              </Typography>
            </div>
            <div>
              <Button
                component={Link}
                variant="contained"
                color="primary"
                href="/signin"
                naked
                className={classes.mr2}
              >
                Sign in
              </Button>

              <Button href="#features" variant="outlined" color="primary">
                Check features
              </Button>
            </div>
          </Grid>
          <Hidden smDown>
            <Grid item md={6}>
              <Image
                src="/images/headerImage.jpg"
                className={classes.image}
                alt="header example"
                width={1024}
                height={566}
                layout="responsive"
                loading="eager"
              />
            </Grid>
          </Hidden>
        </Grid>
      </Container>
    </section>
  );
}
