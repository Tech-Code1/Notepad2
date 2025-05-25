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
    setupDefaultProject, // Added this
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

  const handleSetupDefaultProject = async () => {
    await setupDefaultProject();
    // No navigation needed here, component will re-render due to store changes
    // and AppLayout/NoteEditorView will respond to the new state.
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
        
        {/* New Button Added Below */}
        <button
          onClick={handleSetupDefaultProject}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg text-md
                     flex items-center space-x-2 shadow-lg transform transition-transform hover:scale-105"
        >
          <FaPlus /> {/* Or other relevant icon */}
          <span>Crear Proyecto de Ejemplo</span>
        </button>
      </div>
    );
  }

  // --- Common elements when projectRootPath is SET ---
  // This wrapper will contain the guidance message and then either the "no notes" state or the "notes exist" state.
  return (
    <div className="p-4 md:p-6"> {/* Consistent padding for the view */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2 sm:mb-0">
          Explorador de Notas
        </h1>
        <button
          onClick={handleCreateFirstNoteAndNavigate} // This button creates a loose page
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 text-sm shadow-md hover:shadow-lg transition-shadow"
        >
          <FaPlus />
          <span>Nueva Nota Rápida</span>
        </button>
      </div>

      <p className="text-lg text-text-secondary mb-8 p-3 bg-gray-800 rounded-md shadow">
        Selecciona o crea un notebook/página desde el panel izquierdo para empezar a editar.
      </p>

      {/* --- Conditional rendering based on notes.length --- */}
      {notes.length === 0 ? (
        // ESTADO 2: Hay projectRootPath pero no hay notas
        <div className="flex flex-col items-center justify-center text-center p-10 bg-bg-secondary rounded-lg shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Tu carpeta de notas está vacía</h2>
          <p className="text-md text-text-secondary mb-6 max-w-md">
            Puedes crear una "Nueva Nota Rápida" arriba, o bien organizar tus ideas creando Notbooks y Páginas en el panel izquierdo.
          </p>
          {/* The "Crear tu primera nota" button here is redundant if the "Nueva Nota Rápida" button is already present above.
              The guidance message directs to the sidebar for more structured creation.
              If a specific "Create first note" button is still desired here, it should probably call createNewFile(null)
              which is what handleCreateFirstNoteAndNavigate does.
          */}
        </div>
      ) : (
        // ESTADO 3: Hay projectRootPath y hay notas -> Muestra las cards
        <div className="flex flex-wrap gap-4">
          {notes.map((note) => (
            <NoteCard key={note.path} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllNotesView;