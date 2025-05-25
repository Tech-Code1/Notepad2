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
    saveCurrentFile,
    createNewFile, // Added createNewFile
  } = useFileStore();
  
  const projectRootPath = useFileStore((state) => state.projectRootPath);
  const storeError = useFileStore((state) => state.error); // Added for error handling
  // const clearError = useFileStore((state) => state.clearError); // NOTE: clearError action is not yet implemented in the store.
  
  const [isNewNoteFlow, setIsNewNoteFlow] = useState(false); // True if current note is new and unsaved

  useEffect(() => {
    if (!projectRootPath && !isLoading) { // isLoading check prevents redirect while projectRootPath might be loading
      console.log("NoteEditorView: No project root. Redirecting to /all-notes.");
      navigate('/all-notes', { replace: true });
    }
  }, [projectRootPath, navigate, isLoading]);

  useEffect(() => {
    if (!projectRootPath) { // Ensure project root is available before proceeding
      return;
    }

    const decodedPathFromUrl = decodeURIComponent(rawNoteId || "");

    if (rawNoteId === "new") {
      setIsNewNoteFlow(true);
      // If currentFilePath isn't already for an unsaved note, initialize one.
      // This handles direct navigation to /note/new or refreshing /note/new.
      if (!currentFilePath || !currentFilePath.startsWith('unsaved-')) {
        const activeNBPath = useFileStore.getState().activeNotebookPath;
        createNewFile(activeNBPath || null); 
      }
    } else if (decodedPathFromUrl) { // Existing note path from URL
      setIsNewNoteFlow(false);
      // If the store's current file is not what the URL wants, or if content is missing.
      // The `!currentFileContent` check is important for cases where currentFilePath might be correct
      // but the content hasn't been loaded yet (e.g., after a refresh or direct URL entry).
      // However, ensure it doesn't prevent loading an intentionally empty file.
      // A better check might be if openFile is needed because the path changed,
      // or if the path is the same but content is truly absent (not just an empty string for an empty file).
      // For now, `!currentFileContent` might be too aggressive if empty files are valid and expected.
      // Let's refine to: if path is different OR if path is same but currentFilePath is null (meaning not loaded yet)
      if (decodedPathFromUrl !== currentFilePath || (decodedPathFromUrl === currentFilePath && currentFileContent === '' && originalFileContent === '')) {
         // The condition `currentFileContent === '' && originalFileContent === ''` is a heuristic
         // to check if the file is "empty" because it hasn't been loaded, versus being an actual empty file.
         // A more robust way would be for openFile to handle not re-loading if already loaded.
         // Or for currentFilePath to be null until openFile successfully loads content.
         // Given the current store, this condition tries to reload if path matches but content seems "unloaded".
        if(decodedPathFromUrl !== currentFilePath || !useFileStore.getState().originalFileContent) { // Check original content to be more specific
            openFile(decodedPathFromUrl);
        }
      }
    } else { 
      // No valid rawNoteId or decodedPathFromUrl (e.g. /note/ or /note/#)
      console.warn("NoteEditorView: Invalid or empty noteId in URL after decode. currentFilePath is:", currentFilePath);
      if (!currentFilePath) { // If no file is active in store, go to all notes
          navigate('/all-notes', { replace: true });
      }
      // If currentFilePath IS set, AppLayout.tsx's useEffect should handle redirecting to /note/:currentFilePath
      // So, we might not need to do anything else here if currentFilePath is valid.
    }
  }, [rawNoteId, currentFilePath, currentFileContent, openFile, createNewFile, navigate, projectRootPath, originalFileContent]);


  const handleSave = async () => {
    await saveCurrentFile();
    const savedFilePath = useFileStore.getState().currentFilePath;
    // If it was a new note flow and the file path is now set (meaning save was successful)
    if (isNewNoteFlow && savedFilePath && !savedFilePath.startsWith('unsaved-')) {
      setIsNewNoteFlow(false); // No longer a new note flow
      // Navigate to the new path, replacing /note/new in history
      navigate(`/note/${encodeURIComponent(savedFilePath)}`, { replace: true });
    }
  };

  // Título a mostrar
  const [displayTitle, setDisplayTitle] = useState<string>("Cargando...");

  useEffect(() => {
    const setTitle = async () => {
      if (isNewNoteFlow && currentFilePath && currentFilePath.startsWith('unsaved-')) {
        // For new, unsaved notes, use a generic title or extract from temp path if desired
        const tempName = currentFilePath.substring(currentFilePath.lastIndexOf(currentFilePath.includes('/') ? '/' : '\\') + 1);
        setDisplayTitle(`Nueva Nota (${tempName.replace(/\.[^/.]+$/, "")})`);
      } else if (currentFilePath) {
        const sep = await window.electronAPI.pathSeparator();
        setDisplayTitle(currentFilePath.split(sep).pop()?.replace(/\.[^/.]+$/, "") || "Sin título");
      } else if (rawNoteId && rawNoteId !== "new") {
        setDisplayTitle(decodeURIComponent(rawNoteId)); // While loading
      } else {
        setDisplayTitle("Editor de Notas"); // Fallback title
      }
    };
    setTitle();
  }, [isNewNoteFlow, currentFilePath, rawNoteId]);

  // If projectRootPath is null and not loading, component will render briefly then redirect.
  if (!projectRootPath && !isLoading) {
      return <p className="p-4">Redirigiendo a la selección de proyecto...</p>;
  }

  // Check for store errors (e.g., from a failed openFile attempt)
  if (storeError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error al Cargar la Nota</h2>
        <p className="text-md text-text-secondary mb-6 max-w-md">{storeError}</p>
        <button
          onClick={() => {
            // if (clearError) clearError(); // Would call clearError here if it existed
            navigate('/all-notes', { replace: true });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg text-md"
        >
          Volver a Todas las Notas
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{displayTitle}</h2>
        <button
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading && !isNewNoteFlow ? "Cargando..." : (currentFilePath && !currentFilePath.startsWith('unsaved-') ? "Guardar" : "Guardar Como...")}
        </button>
      </div>

      {/*
        // TODO: Future Editor.js Integration Requirements:
        // 1. Initialization:
        //    - The Editor.js instance should be initialized with data derived from
        //      `currentFileContent` from the useFileStore.
        //    - Note: `currentFileContent` might be raw Markdown or some other format.
        //      This content may need to be parsed into Editor.js's specific block format
        //      before being passed to the editor for initialization.
        //
        // 2. Content Updates (when currentFilePath or currentFileContent changes):
        //    - When `currentFilePath` changes (indicating a new note is selected) or
        //      when `currentFileContent` is updated programmatically (e.g., after reverting changes),
        //      the Editor.js instance must reflect the new content.
        //    - Common strategies for this include:
        //      a) Using a `key` prop on the Editor.js wrapper component, tied to `currentFilePath`.
        //         Changing the key will cause React to re-mount the component, thus re-initializing
        //         Editor.js with the new content. This is often the simplest approach.
        //         Example: `<EditorJsWrapper key={currentFilePath} data={parsedContent} />`
        //      b) Using a `useEffect` hook that observes `currentFileContent` (or `currentFilePath`).
        //         When a change is detected, this effect would call an Editor.js API method
        //         to update its content.
        //         Example: `editor.render(newBlocks);` or `editor.clear(); editor.blocks.render(newBlocks);`
        //         This requires careful handling of the editor instance and its lifecycle.
        //
        // 3. Saving Content:
        //    - When saving, the Editor.js instance will provide its content in its specific
        //      block format. This data will need to be serialized (e.g., to Markdown, HTML, or JSON)
        //      before being saved as a string in `currentFileContent` via `updateCurrentFileContent`.
      */}
      <textarea
        className="w-full h-[calc(100vh-10rem)] p-4 bg-bg-secondary text-text-primary border border-border-color rounded-md focus:ring-accent-primary focus:border-accent-primary"
        value={currentFileContent}
        onChange={(e) => updateCurrentFileContent(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        disabled={isLoading && !isNewNoteFlow} // Disable if loading an existing note
      />
    </div>
  );
};

export default NoteEditorView;