import { useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import Layout from './Layout/Layout';

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Limpiar clases previas
    root.classList.add(theme); // Tailwind usa la clase en <html> por defecto para `darkMode: 'class'`
  }, [theme]);

  return <Layout />;
}

export default App;