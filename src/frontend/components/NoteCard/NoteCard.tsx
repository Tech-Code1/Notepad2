import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSystemItem } from '@/store/fileStore'; // Asumiendo esta interfaz de tu store

interface NoteCardProps {
  note: FileSystemItem; // O una interfaz más específica para notas si la tienes
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const navigate = useNavigate();
  // Simplificación para el ID de la nota. Deberías tener un ID único y estable.
  // Usar el nombre del archivo sin extensión como ID para la ruta.
  const noteId = note.name.replace(/\.[^/.]+$/, "");

  const handleClick = () => {
    navigate(`/note/${encodeURIComponent(noteId)}`);
  };

  // Placeholder para la fecha - necesitarías obtener esto del 'note' object
  const lastModified = new Date().toLocaleDateString(); // Reemplazar con note.modifiedDate o similar

  return (
    <button
      onClick={handleClick}
      className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.666rem)] xl:w-[calc(25%-0.75rem)]
                 bg-bg-secondary hover:bg-bg-tertiary p-4 rounded-lg shadow
                 text-left transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
      // Ajusta las clases de ancho responsivo según tus preferencias
    >
      <h3 className="text-lg font-semibold text-text-primary truncate mb-1" title={note.name}>
        {note.name.replace(/\.[^/.]+$/, "")} {/* Mostrar nombre sin extensión */}
      </h3>
      <p className="text-sm text-text-secondary mb-3 truncate">
        {/* Aquí podría ir un snippet del contenido de la nota si lo tienes */}
        Contenido de ejemplo o primera línea...
      </p>
      <p className="text-xs text-text-tertiary">
        Modificado: {lastModified}
      </p>
    </button>
  );
};

export default NoteCard;