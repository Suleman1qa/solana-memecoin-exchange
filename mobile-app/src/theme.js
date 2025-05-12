import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#9945FF',
    secondary: '#14F195',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#FF5555',
    positive: '#14F195',
    negative: '#FF5555',
    card: '#222222',
    border: '#333333',
    notification: '#9945FF',
  },
  fonts: {
    ...DefaultTheme.fonts,
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};
