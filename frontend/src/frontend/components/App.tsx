// src/App.tsx
import useThemeStore from '@/store/themeStore';
import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './Layout/AppLayout';
import AllNotesView from '../views/AllNotesView';
import NoteEditorView from '../views/NoteEditorView';
import SettingsView from '../views/SettingsView';

// Importa tus componentes de layout y vistas


function App() {
  const theme = useThemeStore((state) => state.theme);

  // Efecto para aplicar la clase del tema al elemento <html>
  useEffect(() => {
    const rootHtmlElement = window.document.documentElement;
    rootHtmlElement.classList.remove('light', 'dark'); // Limpiar clases previas
    rootHtmlElement.classList.add(theme); // Aplicar la clase del tema actual
  }, [theme]);

  return (
    <HashRouter> {/* O BrowserRouter si prefieres y tu configuración de Electron lo maneja bien */}
      <Routes>
        {/* La ruta principal ahora usa AppLayout */}
        <Route path="/" element={<AppLayout />}>
          {/* Ruta índice: redirige a /all-notes por defecto */}
          <Route index element={<Navigate to="/all-notes" replace />} />

          {/* Rutas para las diferentes vistas que se renderizarán dentro de AppLayout */}
          <Route path="all-notes" element={<AllNotesView />} />
          <Route path="note/:noteId" element={<NoteEditorView />} />
          {/* 
            Si tienes vistas separadas para estos, las defines aquí.
            Si son solo filtros de AllNotesView, el Sidebar se encargaría de pasar props o cambiar estado.
            <Route path="favorites" element={<FavoritesView />} />
            <Route path="shared" element={<SharedView />} />
            <Route path="tags" element={<TagsView />} />
            <Route path="trash" element={<TrashView />} />
          */}
          <Route path="settings" element={<SettingsView />} />

          {/* Ruta comodín: si ninguna ruta coincide, redirige a /all-notes */}
          <Route path="*" element={<Navigate to="/all-notes" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;