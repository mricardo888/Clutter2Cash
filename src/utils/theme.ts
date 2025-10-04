import { DefaultTheme } from 'react-native-paper';

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
};

// Export theme with spacing and borderRadius included
export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#2E7D32', // Eco green
        accent: '#4CAF50', // Light green
        background: '#F5F5F5', // Light grey
        surface: '#FFFFFF',
        text: '#212121',
        placeholder: '#757575',
        disabled: '#BDBDBD',
        error: '#D32F2F',
        success: '#388E3C',
        warning: '#F57C00',
    },
    roundness: 12,
    fonts: {
        ...DefaultTheme.fonts,
        regular: {
            fontFamily: 'System',
            fontWeight: '400' as const,
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500' as const,
        },
        light: {
            fontFamily: 'System',
            fontWeight: '300' as const,
        },
        thin: {
            fontFamily: 'System',
            fontWeight: '100' as const,
        },
    },
    // Add spacing and borderRadius directly to theme
    spacing,
    borderRadius,
};