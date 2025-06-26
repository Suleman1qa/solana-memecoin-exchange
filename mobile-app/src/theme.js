import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
       primary: '#9945FF',
    secondary: '#14F195',
    background: '#FFFFFF', 
    surface: '#F5F5F5',    
    text: '#222222',       
    error: '#FF5555',
    positive: '#14F195',
    negative: '#FF5555',
    card: '#F0F0F0',
    border: '#CCCCCC',
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
