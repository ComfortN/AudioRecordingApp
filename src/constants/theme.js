import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.textSecondary,
    },
  },
};