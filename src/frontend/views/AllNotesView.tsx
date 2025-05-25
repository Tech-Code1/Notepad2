// src/views/AllNotesView.tsx
import React, { useEffect } from 'react';
import useFileStore from '@/store/fileStore';
import { FaPlus, FaFolderOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import NoteCard from '../components/NoteCard/NoteCard';

const AllNotesView: React.FC = () => {
  const {
    fileSystemTree,
    projectRootPath,
    fetchFileSystemTree,
    createNewFile, // Usaremos esto para el botón de crear primera nota
    isLoading,
    error
  } = useFileStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Si hay un projectRootPath pero no hay archivos (o necesitamos recargar), cargarlos.
    // Esta lógica podría ser más inteligente para evitar recargas innecesarias.
    if (projectRootPath && (fileSystemTree.length === 0 || /* alguna condición para recargar */ false)) {
      fetchFileSystemTree(projectRootPath);
    }
  }, [projectRootPath, fileSystemTree.length, fetchFileSystemTree]);

  const notes = fileSystemTree.filter(item => item.type === 'file');

  const handleCreateFirstNoteAndNavigate = async () => {
    const newFileInfo = await createNewFile(); // Asume que esto prepara una nota en memoria
    // Navegamos a la ruta especial para nuevas notas, NoteEditorView la manejará
    if (newFileInfo.path) { // Si createNewFile devuelve el ID temporal en path
        navigate(`/note/${newFileInfo.path}`); // path aquí es el ID temporal
    } else {
        navigate('/note/new'); // Fallback genérico si path no se devuelve
    }
  };

  const handleOpenFolder = () => {
    fetchFileSystemTree(null); // Esto debería pedir al usuario que seleccione una carpeta
    // Y luego fetchFileSystemTree debería cargar el contenido y setear projectRootPath
  };


  if (isLoading && !projectRootPath) {
    return <div className="flex items-center justify-center h-full"><p>Cargando selector de carpeta...</p></div>;
  }
  if (isLoading && projectRootPath) {
    return <div className="flex items-center justify-center h-full"><p>Cargando notas...</p></div>;
  }
  if (error) {
     return <div className="flex flex-col items-center justify-center h-full text-red-500"><p>Error: {error}</p><button onClick={handleOpenFolder} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Intentar abrir carpeta de nuevo</button></div>;
  }


  // ESTADO 1: No hay projectRootPath
  if (!projectRootPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <svg className="w-24 h-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Bienvenido a tus Notas</h2>
        <p className="text-md text-text-secondary mb-6 max-w-md">
          Para empezar, necesitas seleccionar una carpeta donde se guardarán tus notas.
        </p>
        <button
          onClick={handleOpenFolder}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-md
                     flex items-center space-x-2 shadow-lg transform transition-transform hover:scale-105"
        >
          <FaFolderOpen />
          <span>Abrir Carpeta de Notas</span>
        </button>
      </div>
    );
  }

  // ESTADO 2: Hay projectRootPath pero no hay notas
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-bg-primary rounded-lg">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-accent-primary mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Tu carpeta de notas está vacía</h2>
        <p className="text-md text-text-secondary mb-6 max-w-md">
          ¡Es el momento perfecto para plasmar tus ideas! Crea tu primera nota.
        </p>
        <button
          onClick={handleCreateFirstNoteAndNavigate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-md
                     flex items-center space-x-2 shadow-lg transform transition-transform hover:scale-105"
        >
          <FaPlus />
          <span>Crear tu primera nota</span>
        </button>
      </div>
    );
  }

  // ESTADO 3: Hay projectRootPath y hay notas -> Muestra las cards
  return (
    <div className="p-2"> {/* Añadido padding para la vista general */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Todas las Notas</h1>
        <button
             onClick={handleCreateFirstNoteAndNavigate}
             className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2"
        >
            <FaPlus />
            <span>Nueva Nota</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        {notes.map((note) => (
          <NoteCard key={note.path} note={note} />
        ))}
      </div>
    </div>
  );
};

export default AllNotesView;