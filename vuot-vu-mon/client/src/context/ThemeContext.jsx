import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme definitions - All text in BLACK for better readability
export const themes = {
  blue: {
    id: 'blue',
    name: 'Xanh Dương',
    icon: '💙',
    primary: '#7EC8E3',
    secondary: '#A3D5E6',
    accent: '#C8E9F3',
    background: 'linear-gradient(135deg, #F0F8FF 0%, #E6F3F8 50%, #D4EDF5 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textLight: '#1a1a1a',
    border: '#7EC8E3',
    shadow: 'rgba(126, 200, 227, 0.15)'
  },
  pink: {
    id: 'pink',
    name: 'Hồng',
    icon: '💗',
    primary: '#F5A9B8',
    secondary: '#FAC5D1',
    accent: '#FFE0E9',
    background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE8ED 50%, #FFD6E0 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textLight: '#1a1a1a',
    border: '#F5A9B8',
    shadow: 'rgba(245, 169, 184, 0.15)'
  },
  purple: {
    id: 'purple',
    name: 'Tím',
    icon: '💜',
    primary: '#C8A2D0',
    secondary: '#D9BAE2',
    accent: '#EDD9F3',
    background: 'linear-gradient(135deg, #FAF5FC 0%, #F0E6F5 50%, #E6D9ED 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textLight: '#1a1a1a',
    border: '#C8A2D0',
    shadow: 'rgba(200, 162, 208, 0.15)'
  },
  green: {
    id: 'green',
    name: 'Xanh Lá',
    icon: '💚',
    primary: '#7DC9B8',
    secondary: '#A0DDCC',
    accent: '#C3F0E3',
    background: 'linear-gradient(135deg, #F0FAF7 0%, #E0F5EF 50%, #D0F0E6 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textLight: '#1a1a1a',
    border: '#7DC9B8',
    shadow: 'rgba(125, 201, 184, 0.15)'
  },
  yellow: {
    id: 'yellow',
    name: 'Vàng',
    icon: '💛',
    primary: '#E8D475',
    secondary: '#F5E799',
    accent: '#FFF5BD',
    background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF9E6 50%, #FFF4D6 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textLight: '#1a1a1a',
    border: '#E8D475',
    shadow: 'rgba(232, 212, 117, 0.15)'
  },
  orange: {
    id: 'orange',
    name: 'Cam',
    icon: '🧡',
    primary: '#F5C17F',
    secondary: '#FFD099',
    accent: '#FFE5C2',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEDE0 50%, #FFE2CC 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textLight: '#1a1a1a',
    border: '#F5C17F',
    shadow: 'rgba(245, 193, 127, 0.15)'
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('blue'); // Default: blue

  // Load theme từ localStorage khi mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme CSS variables khi theme thay đổi
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Set CSS variables
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-card-bg', theme.cardBg);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-light', theme.textLight);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-shadow', theme.shadow);

    // Save to localStorage
    localStorage.setItem('app_theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
