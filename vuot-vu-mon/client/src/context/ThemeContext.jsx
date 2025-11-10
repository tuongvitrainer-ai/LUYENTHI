import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme definitions với màu dịu mắt hơn
export const themes = {
  blue: {
    id: 'blue',
    name: 'Xanh Dương',
    icon: '💙',
    primary: '#87CEEB',        // Sky blue - dịu hơn
    secondary: '#B0E0E6',      // Powder blue
    accent: '#ADD8E6',         // Light blue
    background: 'linear-gradient(135deg, #E0F6FF 0%, #B0E0E6 50%, #87CEEB 100%)',
    cardBg: 'rgba(224, 246, 255, 0.9)',
    text: '#2C5F7F',           // Dark blue - dễ đọc hơn
    textLight: '#4A7FA0',
    border: '#87CEEB',
    shadow: 'rgba(135, 206, 235, 0.2)'
  },
  pink: {
    id: 'pink',
    name: 'Hồng',
    icon: '💗',
    primary: '#FFB6C1',
    secondary: '#FFC0CB',
    accent: '#FFD1DC',
    background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 50%, #FFB6C1 100%)',
    cardBg: 'rgba(255, 240, 245, 0.9)',
    text: '#8B4566',
    textLight: '#A65D7A',
    border: '#FFB6C1',
    shadow: 'rgba(255, 182, 193, 0.2)'
  },
  purple: {
    id: 'purple',
    name: 'Tím',
    icon: '💜',
    primary: '#D8BFD8',
    secondary: '#DDA0DD',
    accent: '#E6E6FA',
    background: 'linear-gradient(135deg, #F8F0FF 0%, #E6D5F0 50%, #D8BFD8 100%)',
    cardBg: 'rgba(248, 240, 255, 0.9)',
    text: '#6B4C7A',
    textLight: '#8A6B99',
    border: '#D8BFD8',
    shadow: 'rgba(216, 191, 216, 0.2)'
  },
  green: {
    id: 'green',
    name: 'Xanh Lá',
    icon: '💚',
    primary: '#98D8C8',
    secondary: '#B4E7CE',
    accent: '#C8F4E8',
    background: 'linear-gradient(135deg, #E8FFF5 0%, #C8F4E8 50%, #98D8C8 100%)',
    cardBg: 'rgba(232, 255, 245, 0.9)',
    text: '#2D6A5C',
    textLight: '#4A8A7A',
    border: '#98D8C8',
    shadow: 'rgba(152, 216, 200, 0.2)'
  },
  yellow: {
    id: 'yellow',
    name: 'Vàng',
    icon: '💛',
    primary: '#F0E68C',
    secondary: '#FFFACD',
    accent: '#FFFFE0',
    background: 'linear-gradient(135deg, #FFFEF0 0%, #FFF9C4 50%, #F0E68C 100%)',
    cardBg: 'rgba(255, 254, 240, 0.9)',
    text: '#857545',
    textLight: '#A59465',
    border: '#F0E68C',
    shadow: 'rgba(240, 230, 140, 0.2)'
  },
  orange: {
    id: 'orange',
    name: 'Cam',
    icon: '🧡',
    primary: '#FFD5A8',
    secondary: '#FFDAB9',
    accent: '#FFE4C4',
    background: 'linear-gradient(135deg, #FFF5E6 0%, #FFDAB9 50%, #FFD5A8 100%)',
    cardBg: 'rgba(255, 245, 230, 0.9)',
    text: '#8B6545',
    textLight: '#A67D5C',
    border: '#FFD5A8',
    shadow: 'rgba(255, 213, 168, 0.2)'
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
