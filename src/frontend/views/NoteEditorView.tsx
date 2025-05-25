// src/views/NoteEditorView.tsx
import React, { useEffect, useState }from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFileStore from '@/store/fileStore';

const NoteEditorView: React.FC = () => {
  const { noteId: rawNoteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const {
    currentFilePath,
    currentFileContent,
    originalFileContent,
    isDirty,
    isLoading,
    openFile,
    updateCurrentFileContent,
    saveCurrentFile, // saveCurrentFile ya maneja "Guardar Como" si currentFilePath es null
    setProjectRootPath, // Para la demo de "Sin título"
  } = useFileStore();

  const [isNewNoteFlow, setIsNewNoteFlow] = useState(false);
  const noteId = decodeURIComponent(rawNoteId || "");

  useEffect(() => {
    if (noteId === "new") {
      setIsNewNoteFlow(true);
      // createNewFile ya debería haber seteado currentFileContent, currentFilePath=null, isDirty=true
      // No necesitamos llamar a openFile aquí.
      // Si currentFilePath no es null (ej. el usuario navegó de una nota guardada a /note/new),
      // el store ya debería haber sido limpiado por createNewFile().
      if (currentFilePath !== null) {
        console.warn("Flujo de nota nueva, pero currentFilePath no es null. Esto puede indicar un problema de estado.");
        // Podrías forzar un estado "limpio" aquí si es necesario,
        // pero idealmente createNewFile() lo maneja.
      }
    } else if (noteId) {
      setIsNewNoteFlow(false);
      // Esto es para una nota existente. Necesitamos encontrar su path real.
      // ESTA PARTE NECESITA MEJORARSE: ¿Cómo mapeas `noteId` a un `filePath`?
      // Si `noteId` ES el nombre del archivo (sin extensión) y tienes projectRootPath, podrías construirlo.
      // O si `noteId` es un ID único que mapea a un path en tu `fileSystemTree`.
      // Por ahora, asumiré que necesitas una función en tu store o una lógica aquí
      // para encontrar el filePath basado en el noteId.
      const fileToOpen = findFilePathFromNoteId(noteId); // Necesitas implementar esto
      if (fileToOpen && fileToOpen !== currentFilePath) {
        openFile(fileToOpen);
      } else if (!fileToOpen) {
        console.error(`No se pudo encontrar el archivo para noteId: ${noteId}`);
        navigate("/all-notes"); // Fallback
      }
    }
  }, [noteId, openFile, currentFilePath, navigate]);

  // Función placeholder, necesitas una lógica real aquí
  const findFilePathFromNoteId = (id: string): string | null => {
    // Busca en fileSystemTree o en una lista de notas con IDs si la tienes.
    // Ejemplo muy simple si el ID es el nombre del archivo:
    const projectRoot = useFileStore.getState().projectRootPath;
    const tree = useFileStore.getState().fileSystemTree;
    if (!projectRoot || !tree) return null;

    // Busca un archivo cuyo nombre (sin extensión) coincida con el id
    const foundFile = tree.find(item => item.type === 'file' && item.name.replace(/\.[^/.]+$/, "") === id);
    return foundFile ? foundFile.path : null;
  };

  const handleSave = async () => {
    await saveCurrentFile();
    // Si era una nota nueva, después de guardar, currentFilePath ya no será null.
    // La navegación podría necesitar actualizarse si el nombre del archivo cambió y se usa en la URL.
    // Si saveCurrentFile (vía saveFileAs para nuevas notas) actualiza currentFilePath,
    // y currentFilePath ahora es la base para tu noteId en la URL...
    const savedFilePath = useFileStore.getState().currentFilePath;
    if (isNewNoteFlow && savedFilePath) {
      const newNoteId = savedFilePath.split(await window.electronAPI.pathSeparator()).pop()?.replace(/\.[^/.]+$/, "") || "nota-guardada";
      setIsNewNoteFlow(false); // Ya no es "nueva"
      navigate(`/note/${encodeURIComponent(newNoteId)}`, { replace: true }); // Actualiza la URL
    }
  };

  // Título a mostrar
  const [displayTitle, setDisplayTitle] = useState<string>("Cargando...");

  useEffect(() => {
    const setTitle = async () => {
      if (isNewNoteFlow) {
        setDisplayTitle("Nueva Nota (sin guardar)");
      } else if (currentFilePath) {
        const sep = await window.electronAPI.pathSeparator();
        setDisplayTitle(currentFilePath.split(sep).pop() || "Sin título");
      } else if (noteId && noteId !== "new") {
        setDisplayTitle(noteId); // Mientras se carga
      } else {
        setDisplayTitle("Cargando...");
      }
    };
    setTitle();
  }, [isNewNoteFlow, currentFilePath, noteId]);


  // Simulación para que el sidebar "Archivo/Esquema" aparezca
  // En un escenario real, esto se basaría en si currentFilePath es válido y no "new"
  useEffect(() => {
    if (noteId === "new" && currentFilePath === null) {
      // Para la demo, si es "new", simulamos que no hay projectRootPath para que se muestre el sidebar normal
      // o ajustamos la lógica en AppLayout.tsx
      // Una mejor forma es que AppLayout mire `currentFilePath`. Si es null y estamos en /note/new,
      // podría mostrar el sidebar normal o uno especial para "nueva nota".
      // Pero como dijiste que al darle click a newNote se cambia al sidebar de Archivo/Esquema,
      // entonces currentFilePath DEBERÍA tener un valor (aunque sea temporal y no físico)
      // o tu lógica en AppLayout para cambiar de sidebar debe considerar el estado "nueva nota".

      // Para cumplir con "al darle click en new Note (...) deberia mostrarse como la imagen (Archivo/Esquema)":
      // `createNewFile` en el store debería setear `currentFilePath` a algo no-nulo,
      // aunque sea un placeholder como "UNSAVED_NOTE" que luego `AppLayout` interprete.
      // O `AppLayout` podría tener una lógica como:
      // `const showFileOutlineSidebar = currentFilePath || (location.pathname === '/note/new');`

      // Vamos a ASUMIR que createNewFile SÍ establece currentFilePath a un valor temporal no nulo
      // o que AppLayout maneja el caso '/note/new' para mostrar FileOutlineSidebar.
    }
  }, [noteId, currentFilePath]);


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{displayTitle}</h2>
        <button
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : (currentFilePath ? "Guardar" : "Guardar Como...")}
        </button>
      </div>
      <textarea
        className="w-full h-[calc(100vh-10rem)] p-4 bg-bg-secondary text-text-primary border border-border-color rounded-md focus:ring-accent-primary focus:border-accent-primary"
        value={currentFileContent}
        onChange={(e) => updateCurrentFileContent(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        disabled={isLoading && !isNewNoteFlow && !currentFilePath} // Deshabilitar si está cargando una nota existente
      />
    </div>
  );
};

export default NoteEditorView;