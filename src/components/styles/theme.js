import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

// Create a theme instance with responsive font sizes
const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#BB86FC',
      },
      secondary: {
        main: '#03DAC5',
      },

      error: {
        main: '#CF6679',
      },
      background: {
        paper: '#1E1E1E',
        default: '#121212',
      },
    },
    overrides: {
      MuiAppBar: {
        colorDefault: {
          backgroundColor: '#1F1F1F',
        },
      },
      MuiButton: {
        outlined: {
          padding: '6px 16px',
        },
      },
    },
  })
);

export default theme;
