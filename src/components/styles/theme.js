import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance with responsive font sizes
const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      error: {
        main: red.A400,
      },
    },
  })
);

export default theme;
