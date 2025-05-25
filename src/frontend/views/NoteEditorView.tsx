// src/views/NoteEditorView.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFileStore from '@/store/fileStore';
import EditorJS, { OutputData } from '@editorjs/editorjs'; // Added EditorJS import
import Header from '@editorjs/header'; // Added Header tool
import List from '@editorjs/list'; // Added List tool
import ImageTool from '@editorjs/image'; // Added Image tool (basic for now)

/*
  EXPECTED ELECTRON API for window.electronAPI.saveImage:
  (To be implemented in preload.ts and main process)

  Signature:
  saveImage(fileData: { buffer: ArrayBuffer, name: string, type: string }): Promise<{ success: boolean; url?: string; error?: string; }>

  Behavior:
  - Takes image buffer, name, and type.
  - Requires `projectRootPath` to be set in the store (accessed via `useFileStore.getState().projectRootPath` in the uploader).
  - Generates a unique filename.
  - Saves the image to `projectRootPath/.assets/images/unique-filename`.
    (The `.assets/images` subdirectory should be created if it doesn't exist).
  - Returns `{ success: true, url: 'file:///absolute/path/to/projectRootPath/.assets/images/unique-name.png' }` on success.
    The URL must be an absolute file path usable by Electron to load the image.
  - Returns `{ success: false, error: 'Error message' }` on failure.
*/

// Define EDITOR_TOOLS (can be outside the component if it doesn't depend on props/state)
const EDITOR_TOOLS = {
  header: Header,
  list: List,
  image: {
    class: ImageTool,
    config: {
      uploader: {
        async uploadByFile(file: File): Promise<{ success: boolean; file: { url: string } } | { success: boolean; error: { message: string } }> {
          const projectRootPath = useFileStore.getState().projectRootPath;
          if (!projectRootPath) {
            console.error("ImageTool: Project root not set. Cannot save image.");
            return { success: 0, error: { message: "Project root not set. Cannot save image." } };
          }

          try {
            // Convert File to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Call the new Electron API (hypothetical at this stage for main process)
            const result = await window.electronAPI.saveImage({
              buffer: arrayBuffer,
              name: file.name,
              type: file.type,
            });

            if (result.success && result.url) {
              return {
                success: 1,
                file: {
                  url: result.url, // URL provided by the main process
                },
              };
            } else {
              console.error("Image upload failed:", result.error);
              return { success: 0, error: { message: result.error || "Image upload to main process failed." } };
            }
          } catch (error: any) {
            console.error("Error processing image for upload:", error);
            return { success: 0, error: { message: error.message || "Error processing image file." } };
          }
        },
        // uploadByUrl: async (url: string) => { /* Optional: for pasting image URLs */ }
      },
    }
  },
};


const NoteEditorView: React.FC = () => {
  const { noteId: rawNoteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const {
    currentFilePath,
    currentFileContent,
    originalFileContent, // Keep this for the main useEffect dependency if needed
    isDirty,
    isLoading,
    openFile,
    updateCurrentFileContent,
    saveCurrentFile,
    createNewFile, // Now correctly getting from the store (after reset)
    projectRootPath, // Selecting projectRootPath
    error: storeError, // Selecting error state
  } = useFileStore();
  
  // const clearError = useFileStore((state) => state.clearError); // NOTE: clearError action is not yet implemented in the store.
  
  const [isNewNoteFlow, setIsNewNoteFlow] = useState(false); // True if current note is new and unsaved
  // The editorInstanceRef is now part of EditorWrapper


  const handleEditorDataChange = (editorData: OutputData) => {
    // console.log("Editor data changed:", editorData); // For debugging
    try {
      const jsonString = JSON.stringify(editorData);
      updateCurrentFileContent(jsonString);
    } catch (error) {
      console.error("Error stringifying editor data:", error);
      // Optionally, handle or log this error more formally
    }
  };

  useEffect(() => {
    if (!projectRootPath && !isLoading) { 
      console.log("NoteEditorView: No project root. Redirecting to /all-notes.");
      navigate('/all-notes', { replace: true });
    }
  }, [projectRootPath, navigate, isLoading]);

  useEffect(() => {
    if (!projectRootPath) { 
      return;
    }

    const decodedPathFromUrl = decodeURIComponent(rawNoteId || "");

    if (rawNoteId === "new") {
      setIsNewNoteFlow(true);
      if (!currentFilePath || !currentFilePath.startsWith('unsaved-')) {
        const activeNBPath = useFileStore.getState().activeNotebookPath; // Get latest for new file
        createNewFile(activeNBPath || null); 
      }
    } else if (decodedPathFromUrl) { 
      setIsNewNoteFlow(false);
      // Condition to open file: path is different, OR path is same but original content not loaded (heuristic)
      if (decodedPathFromUrl !== currentFilePath || !originalFileContent) { 
        openFile(decodedPathFromUrl);
      }
    } else { 
      console.warn("NoteEditorView: Invalid or empty noteId in URL after decode. currentFilePath is:", currentFilePath);
      if (!currentFilePath) { 
          navigate('/all-notes', { replace: true });
      }
    }
  }, [rawNoteId, currentFilePath, openFile, createNewFile, navigate, projectRootPath, originalFileContent]);


  const handleSave = async () => {
    // For Editor.js, currentFileContent will be updated by the editor's onChange callback.
    // The logic here remains the same for triggering save.
    await saveCurrentFile(); 
    const savedFilePath = useFileStore.getState().currentFilePath;
    if (isNewNoteFlow && savedFilePath && !savedFilePath.startsWith('unsaved-')) {
      setIsNewNoteFlow(false); 
      navigate(`/note/${encodeURIComponent(savedFilePath)}`, { replace: true });
    }
  };

  // Título a mostrar
  const [displayTitle, setDisplayTitle] = useState<string>("Cargando...");

  useEffect(() => {
    const setTitle = async () => {
      if (isNewNoteFlow && currentFilePath && currentFilePath.startsWith('unsaved-')) {
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
  
  // Parse currentFileContent for Editor.js
  let parsedDataForEditor: OutputData | null = null;
  if (currentFilePath || isNewNoteFlow) { // Only attempt parse if there's a file context or new note flow
    if (currentFileContent) {
      try {
        parsedDataForEditor = JSON.parse(currentFileContent);
      } catch (e) {
        console.warn("Error parsing currentFileContent as JSON. Content might be Markdown or other format. Content:", currentFileContent, "Error:", e);
        // Display the raw content as a paragraph if it's not JSON
        parsedDataForEditor = {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: "Error: El contenido de la nota no es JSON válido. Se muestra el contenido original:" } },
                   { type: 'paragraph', data: { text: currentFileContent } }] // Show raw content
        };
      }
    } else if (isNewNoteFlow && !currentFileContent) {
        // For a new note flow, if content is empty, default to an empty structure.
        parsedDataForEditor = { time: Date.now(), blocks: [] }; 
    }
    // If currentFileContent is null/empty for an existing file, parsedDataForEditor remains null,
    // and EditorWrapper will use its default { time: Date.now(), blocks: [] }.
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
        // (Comment block already present from previous step, no need to re-add)
      */}
      <EditorWrapper
        key={currentFilePath || `new-note-${rawNoteId || Date.now()}`} // Unique key for new notes too
        initialData={parsedDataForEditor}
        editorTools={EDITOR_TOOLS}
        placeholder="Comienza a escribir tu increíble nota aquí..."
        onChangeCallback={handleEditorDataChange} // Pass the handler
      />
    </div>
  );
};

// --- EditorWrapper Component ---
interface EditorWrapperProps {
  initialData: OutputData | null;
  onChangeCallback: (data: OutputData) => void; // Renamed for clarity
  editorTools: any;
  placeholder: string;
}

const EditorWrapper: React.FC<EditorWrapperProps> = ({ initialData, onChangeCallback, editorTools, placeholder }) => {
  const editorInstanceRef = useRef<EditorJS | null>(null);
  // Using React.useId() for a stable, unique ID per EditorWrapper instance
  const editorHolderId = `editorjs-holder-${React.useId()}`; 

  useEffect(() => {
    if (editorInstanceRef.current) { 
        try {
            editorInstanceRef.current.destroy();
        } catch (e) {
            console.warn("Error destroying previous Editor.js instance in wrapper:", e);
        }
        editorInstanceRef.current = null;
    }
    
    const editor = new EditorJS({
      holder: editorHolderId,
      tools: editorTools,
      data: initialData || { time: Date.now(), blocks: [] }, // Default to empty if initialData is null
      placeholder: placeholder,
      async onChange(api, event) { // api is an instance of Editor.js API
        // Check if the editor instance is available, though 'api' should be it.
        if (api && typeof api.saver.save === 'function') {
          const outputData = await api.saver.save();
          onChangeCallback(outputData); // Call the passed-in handler
        }
      }
    });
    editorInstanceRef.current = editor;

    return () => {
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        try {
            editorInstanceRef.current.destroy();
        } catch (e) {
            console.warn("Error destroying Editor.js instance on unmount:", e);
        }
      }
      editorInstanceRef.current = null; 
    };
  }, [initialData, editorTools, placeholder, editorHolderId]); 

  return <div id={editorHolderId} className="prose max-w-none min-h-[calc(100vh-12rem)] bg-bg-alt p-4 rounded-md shadow-inner"/>;
};


export default NoteEditorView;