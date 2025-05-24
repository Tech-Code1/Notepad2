import React, { useEffect } from 'react';
import useFileStore, { FileSystemItem } from '@/store/fileStore';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import NoteCard from '../components/NoteCard/NoteCard';

const AllNotesView: React.FC = () => {
  const { fileSystemTree, projectRootPath, fetchFileSystemTree, createNewFile } = useFileStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar archivos si hay un directorio raíz y no se han cargado
    // Esto puede necesitar lógica más sofisticada para evitar recargas innecesarias
    if (projectRootPath && fileSystemTree.length === 0) {
      fetchFileSystemTree(projectRootPath);
    }
  }, [projectRootPath, fileSystemTree, fetchFileSystemTree]);

  // Filtrar solo archivos (asumiendo que las notas son archivos)
  const notes = fileSystemTree.filter(item => item.type === 'file');

  const handleCreateFirstNote = async () => {
    const newFile = await createNewFile();
    if (newFile && newFile.path) {
      const noteId = newFile.name.replace(/\.[^/.]+$/, "");
      navigate(`/note/${encodeURIComponent(noteId)}`);
    }
  };

  if (!projectRootPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <svg className="w-24 h-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Bienvenido a tus Notas</h2>
        <p className="text-md text-text-secondary mb-6 max-w-md">
          Parece que aún no has abierto una carpeta de proyecto.
          Por favor, abre una carpeta para empezar a organizar y crear tus notas.
        </p>
        {/* Aquí podrías poner un botón para "Abrir Carpeta" que llame a fetchFileSystemTree(null) */}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-bg-primary rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-accent-primary mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">No hay notas todavía</h2>
        <p className="text-md text-text-secondary mb-6 max-w-md">
          ¡Parece que tu lienzo está en blanco! Es el momento perfecto para plasmar tus ideas.
        </p>
        <button
          onClick={handleCreateFirstNote}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-md
                     flex items-center space-x-2 shadow-lg transform transition-transform hover:scale-105"
        >
          <FaPlus />
          <span>Crear tu primera nota</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Todas las Notas</h1>
      <div className="flex flex-wrap gap-4"> {/* Usar flex-wrap para el layout de cards */}
        {notes.map((note) => (
          <NoteCard key={note.path} note={note} />
        ))}
      </div>
    </div>
  );
};

export default AllNotesView;