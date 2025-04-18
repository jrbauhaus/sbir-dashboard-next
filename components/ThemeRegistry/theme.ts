import { createTheme } from '@mui/material/styles';

// Define the fonts in the theme file for organization
export const spaceGrotesk = "'Space Grotesk', sans-serif";
export const ibmPlexMono = "'IBM Plex Mono', monospace";

// Define new two-tone grey palette
const veryDarkGrey = '#181A1B'; // Near black for background
const darkGrey = '#2A2E30'; // Lighter grey for paper/containers
const lightGreyText = '#D1D5DB'; // Primary text
const midGreyText = '#9CA3AF'; // Secondary text / subtle borders
const subtleGreyBorder = '#4B5563'; // Divider line color

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      // Set primary to a subtle color, won't be used much visually
      main: lightGreyText, 
    },
    secondary: {
      // Keep green for status dot? Or change to subtle grey?
      // Let's keep it green for now, can change later.
      main: '#4AE19F', 
    },
    background: {
      default: veryDarkGrey,
      paper: darkGrey,
    },
    text: {
      primary: lightGreyText,
      secondary: midGreyText,
    },
    divider: subtleGreyBorder, // Set the divider color globally
    
    // Update other colors to fit the grey theme
    error: { main: '#F56565' }, // Keep red for errors
    warning: { main: '#ED8936' }, // Keep orange for warnings 
    info: { main: lightGreyText }, // Use primary text for info
    success: { main: '#48BB78' }, // Keep green for success

    action: { // Adjust action colors for the new background
      hover: 'rgba(209, 213, 219, 0.08)', // Light grey hover
      selected: 'rgba(209, 213, 219, 0.16)',
      disabledBackground: 'rgba(209, 213, 219, 0.12)',
      disabled: 'rgba(209, 213, 219, 0.3)',
      focus: 'rgba(209, 213, 219, 0.12)',
    }
  },
  typography: {
    fontFamily: spaceGrotesk, // Set default font
    // We can customize h1, h2, body1, etc., later if needed
    // Example for using mono font on specific elements (like captions or code):
    // caption: {
    //   fontFamily: ibmPlexMono,
    // },
  },
  // Optional: Customize components for the theme
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Keep button text normal case by default
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Ensure paper doesn't have gradients/images by default
        }
      }
    },
    // Add specific overrides if needed, e.g., TableCell borders
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: subtleGreyBorder, // Use the theme divider globally
        }
      }
    }
  }
});

export default theme; 