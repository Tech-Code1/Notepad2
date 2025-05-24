import React from 'react';
import { useParams } from 'react-router-dom';
import useFileStore from '@/store/fileStore'; // Para cargar el contenido del archivo

const NoteEditorView: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const { openFile, currentFileContent, currentFilePath } = useFileStore();

  React.useEffect(() => {
    // Aquí necesitarías una forma de mapear `noteId` (que podría ser un nombre de archivo)
    // a una ruta de archivo completa para llamar a `openFile`.
    // Esto es una simplificación y dependerá de cómo gestiones tus IDs de notas.
    // Si el noteId es el path completo (después de decodificar), puedes usarlo.
    // Si `currentFilePath` ya es el correcto por la navegación desde `createNewFile`,
    // quizás solo necesites verificar si el contenido debe cargarse.

    // Ejemplo muy básico: si noteId es solo el nombre, y tienes projectRootPath
    // const filePathToOpen = projectRootPath ? `${projectRootPath}/${decodeURIComponent(noteId!)}.md` : null;
    // if (filePathToOpen && filePathToOpen !== currentFilePath) {
    //   openFile(filePathToOpen);
    // }
    console.log("Editor para la nota:", decodeURIComponent(noteId || ""));
    // Podrías querer llamar a openFile aquí si el noteId corresponde a un path y no está abierto
  }, [noteId, openFile, currentFilePath]);


  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Editor de Nota: {decodeURIComponent(noteId || "Sin título")}</h2>
      <p className="mb-2">Ruta actual (si hay): {currentFilePath || "Ninguna"}</p>
      <textarea
        className="w-full h-96 p-4 bg-bg-secondary text-text-primary border border-border-color rounded-md focus:ring-accent-primary focus:border-accent-primary"
        defaultValue={currentFileContent || ""} // O usa un estado controlado
        placeholder="Escribe tu nota aquí..."
      />
      {/* Aquí iría tu editor de Markdown o de texto enriquecido */}
    </div>
  );
};

export default NoteEditorView;