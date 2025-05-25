import { create } from 'zustand';

export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  // children?: FileSystemItem[]; // Podrías necesitar esto para una estructura de árbol anidada para notbooks/páginas
}

// Podrías definir interfaces más específicas si es necesario
// export interface Notebook extends FileSystemItem { type: 'directory'; pages: Page[]; }
// export interface Page extends FileSystemItem { type: 'file'; }


interface FileStoreState {
  sidebarOpen: boolean; // Mantener si aún usas un toggle general de sidebar
  toggleSidebar: () => void;

  fileSystemTree: FileSystemItem[];
  projectRootPath: string | null; // El directorio raíz del proyecto de notas

  currentFilePath: string | null; // Ruta del archivo actualmente abierto/editándose
  currentFileContent: string;
  originalFileContent: string;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  // Nuevos estados (opcionales, para el FileOutlineSidebar)
  activeNotebookPath: string | null; // Para resaltar el notbook activo
  // activePagePath ya estaría cubierto por currentFilePath

  setFileSystemTree: (tree: FileSystemItem[]) => void;
  setProjectRootPath: (path: string | null) => void;

  openFile: (filePath: string) => Promise<void>; // filePath ahora es obligatorio para esta acción
  updateCurrentFileContent: (content: string) => void;
  saveCurrentFile: () => Promise<void>;
  saveFileAs: () => Promise<void>; // Para guardar un archivo nuevo o uno existente con otro nombre
  fetchFileSystemTree: (basePath?: string | null) => Promise<void>;
  createNewFile: (parentPath: string | null) => Promise<{ path: string | null; name: string }>; // MODIFIED SIGNATURE
  deleteFile: (filePath: string) => Promise<void>; // Nueva acción útil
  
  // Acciones para seleccionar en FileOutlineSidebar (si es necesario)
  setActiveNotebookPath: (path: string | null) => void;

  // Selectors / Getters
  getNotebooks: () => FileSystemItem[];
  getPagesForNotebook: (notebookPath: string | null) => FileSystemItem[];
  getLoosePages: () => FileSystemItem[];
}

// Placeholder for path separator - ideally, this would be fetched and stored
// For now, we'll assume paths are normalized or use a common separator like '/'
// In a real scenario, this should be `await window.electronAPI.pathSeparator()`
// and potentially stored in the state.
const SEPARATOR = '/'; // TEMPORARY: Assume '/' for logic. This needs to be dynamic.

const useFileStore = create<FileStoreState>((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  fileSystemTree: [],
  projectRootPath: null,

  currentFilePath: null,
  currentFileContent: '',
  originalFileContent: '',
  isDirty: false,
  isLoading: false,
  error: null,

  activeNotebookPath: null,

  setFileSystemTree: (tree) => set({ fileSystemTree: tree }),
  setProjectRootPath: (path) => {
    set({ projectRootPath: path, currentFilePath: null, currentFileContent: '', originalFileContent: '', isDirty: false, activeNotebookPath: null });
    // Si se cambia el root del proyecto, probablemente quieras limpiar el estado del archivo actual
  },
  setActiveNotebookPath: (path) => set({ activeNotebookPath: path }),

  openFile: async (filePath: string) => {
    if (!filePath) {
      console.warn("openFile llamado sin filePath");
      // Podrías abrir el diálogo si filePath es explícitamente `null` o `undefined` y es intencional
      // const selectedPath = await window.electronAPI.openFile();
      // if (!selectedPath) return;
      // filePath = selectedPath;
      return;
    }
    
    // Si el archivo ya está abierto y no está sucio, no hacer nada (o recargar si es necesario)
    // if (get().currentFilePath === filePath && !get().isDirty) return;

    // Si hay cambios sin guardar, preguntar al usuario (esto requiere UI)
    // if (get().isDirty) {
    //   const confirm = await window.confirm("Tienes cambios sin guardar. ¿Descartarlos y abrir el nuevo archivo?");
    //   if (!confirm) return;
    // }

    set({ isLoading: true, error: null });
    try {
      const result = await window.electronAPI.readFile(filePath);
      if (result.content !== undefined && result.path) {
        set({
          currentFilePath: result.path,
          currentFileContent: result.content,
          originalFileContent: result.content,
          isDirty: false,
          isLoading: false,
          activeNotebookPath: result.path.substring(0, result.path.lastIndexOf(await window.electronAPI.pathSeparator())), // Asume que el notbook es la carpeta padre
        });
      } else {
        throw new Error(result.error || 'No se pudo leer el archivo.');
      }
    } catch (err: any) {
      console.error('Error opening file:', err);
      set({ error: `Error al abrir ${filePath}: ${err.message}`, isLoading: false });
    }
  },

  updateCurrentFileContent: (content) => {
    set((state) => ({
      currentFileContent: content,
      isDirty: content !== state.originalFileContent,
    }));
  },

  saveCurrentFile: async () => {
    const { currentFilePath, currentFileContent, projectRootPath } = get();
    if (!currentFilePath) {
      // Si no hay currentFilePath, es un archivo nuevo, llamar a saveFileAs
      return get().saveFileAs();
    }

    set({ isLoading: true });
    try {
      const result = await window.electronAPI.saveFile(currentFilePath, currentFileContent);
      if (result.success && result.path) {
        set({
          currentFilePath: result.path, // El path podría cambiar si el sistema de archivos lo modifica (poco común)
          originalFileContent: currentFileContent,
          isDirty: false,
          isLoading: false,
          error: null,
        });
        // Actualizar el árbol de archivos si se guardó un archivo y estábamos en un proyecto
        if (projectRootPath) {
          await get().fetchFileSystemTree(projectRootPath);
        }
      } else {
        throw new Error(result.error || 'Error al guardar el archivo.');
      }
    } catch (err: any) {
      console.error('Error saving file:', err);
      set({ error: `Error al guardar: ${err.message}`, isLoading: false });
    }
  },

  saveFileAs: async () => {
    const { currentFileContent, projectRootPath } = get();
    set({ isLoading: true });
    try {
      // `saveFile(null, ...)` en tu API de Electron debería abrir el diálogo "Guardar como"
      const result = await window.electronAPI.saveFile(null, currentFileContent);
      if (result.success && result.path) {
        set({
          currentFilePath: result.path,
          originalFileContent: currentFileContent,
          isDirty: false,
          isLoading: false,
          error: null,
          activeNotebookPath: result.path.substring(0, result.path.lastIndexOf(await window.electronAPI.pathSeparator())),
        });
        // Actualizar el árbol de archivos ya que se creó/movió un archivo
        if (projectRootPath) {
          await get().fetchFileSystemTree(projectRootPath);
        }
      } else {
        // Si el usuario cancela el diálogo "Guardar como", result.success podría ser false sin error.
        if(!result.error && !result.path) {
            set({isLoading: false}); // Usuario canceló
            return;
        }
        throw new Error(result.error || 'Error al guardar como.');
      }
    } catch (err: any) {
      console.error('Error saving file as:', err);
      set({ error: `Error al guardar como: ${err.message}`, isLoading: false });
    }
  },

  fetchFileSystemTree: async (basePath?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      let pathToList = basePath !== undefined ? basePath : get().projectRootPath;

      if (pathToList === null) {
        const result = await window.electronAPI.readDirectory(null); // Pide seleccionar carpeta
        if (result.success && result.path && result.items) {
          pathToList = result.path;
          set({ 
            projectRootPath: pathToList,
            fileSystemTree: result.items,
            isLoading: false,
            // Limpiar archivo actual al cambiar de proyecto
            currentFilePath: null, currentFileContent: '', originalFileContent: '', isDirty: false, activeNotebookPath: null
          });
        } else {
          set({ isLoading: false, error: result.error || "No se seleccionó una carpeta de proyecto.", fileSystemTree: [], projectRootPath: null });
        }
        return;
      }
      
      const result = await window.electronAPI.readDirectory(pathToList);
      if (result.success && result.items && result.path) {
        set({
          fileSystemTree: result.items,
          // projectRootPath no debería cambiar aquí a menos que sea la primera carga
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(result.error || 'Error al leer el directorio.');
      }
    } catch (err: any) {
      console.error('Error fetching file system tree:', err);
      set({ error: `Error al cargar archivos: ${err.message}`, isLoading: false, fileSystemTree: [] });
    }
  },

  createNewFile: async (parentPath: string | null) => { // MODIFIED: signature and logic
    const timestamp = Date.now();
    const defaultPageName = `new-page-${timestamp}.md`;
    let tempIdForNewNote: string;

    if (parentPath) {
      // Ensure parentPath does not end with a separator before appending another
      const cleanParentPath = parentPath.endsWith(SEPARATOR) ? parentPath.slice(0, -1) : parentPath;
      tempIdForNewNote = `unsaved-${cleanParentPath}${SEPARATOR}${defaultPageName}`;
    } else {
      tempIdForNewNote = `unsaved-${defaultPageName}`;
    }
    
    const defaultDisplayName = "Nueva Página";

    set({
      currentFilePath: tempIdForNewNote,
      currentFileContent: `# ${defaultDisplayName}\n\n`,
      originalFileContent: '', // New file has no original content on disk
      isDirty: true,         // It's new and unsaved
      isLoading: false,
      error: null,
      activeNotebookPath: parentPath, // Set active notebook to the parent path
    });

    // The returned path is the temporary ID.
    // The name is a generic display name.
    return { path: tempIdForNewNote, name: defaultDisplayName };
  },

  deleteFile: async (filePath: string) => {
    if (!filePath) return;
    // Aquí deberías añadir una confirmación al usuario

    set({ isLoading: true });
    try {
      const result = await window.electronAPI.deleteFile(filePath); // Necesitas implementar esto en el main process
      if (result.success) {
        set({ isLoading: false, error: null });
        // Si el archivo borrado era el actual, limpiar estado
        if (get().currentFilePath === filePath) {
          set({ currentFilePath: null, currentFileContent: '', originalFileContent: '', isDirty: false });
        }
        // Recargar el árbol de archivos
        if (get().projectRootPath) {
          await get().fetchFileSystemTree(get().projectRootPath);
        }
      } else {
        throw new Error(result.error || "Error al borrar el archivo.");
      }
    } catch (err: any) {
      set({ error: `Error al borrar ${filePath}: ${err.message}`, isLoading: false });
    }
  },

  // Selectors / Getters
  getNotebooks: () => {
    const { fileSystemTree, projectRootPath } = get();
    if (!projectRootPath) return [];

    // Ensure projectRootPath ends with a separator for accurate startsWith checks
    const normalizedProjectRootPath = projectRootPath.endsWith(SEPARATOR) ? projectRootPath : projectRootPath + SEPARATOR;

    return fileSystemTree.filter(item => {
      if (item.type !== 'directory') return false;
      // Check if the item path starts with the project root path
      if (!item.path.startsWith(normalizedProjectRootPath)) return false;
      // Check if it's a direct child: no more separators after the projectRootPath part
      const relativePath = item.path.substring(normalizedProjectRootPath.length);
      return !relativePath.includes(SEPARATOR);
    });
  },

  getPagesForNotebook: (notebookPath: string | null) => {
    const { fileSystemTree } = get();
    if (!notebookPath) return [];

    // Ensure notebookPath ends with a separator for accurate startsWith checks
    const normalizedNotebookPath = notebookPath.endsWith(SEPARATOR) ? notebookPath : notebookPath + SEPARATOR;

    return fileSystemTree.filter(item => {
      if (item.type !== 'file') return false;
      // Check if the item path starts with the notebook path
      if (!item.path.startsWith(normalizedNotebookPath)) return false;
      // Check if it's a direct child: no more separators after the notebookPath part
      const relativePath = item.path.substring(normalizedNotebookPath.length);
      return !relativePath.includes(SEPARATOR);
    });
  },

  getLoosePages: () => {
    const { fileSystemTree, projectRootPath } = get();
    if (!projectRootPath) return [];
    
    // Ensure projectRootPath ends with a separator for accurate startsWith checks
    const normalizedProjectRootPath = projectRootPath.endsWith(SEPARATOR) ? projectRootPath : projectRootPath + SEPARATOR;

    return fileSystemTree.filter(item => {
      if (item.type !== 'file') return false;
      // Check if the item path starts with the project root path
      if (!item.path.startsWith(normalizedProjectRootPath)) return false;
      // Check if it's a direct child: no more separators after the projectRootPath part
      const relativePath = item.path.substring(normalizedProjectRootPath.length);
      return !relativePath.includes(SEPARATOR);
    });
  },

}));

// Para acceder a window.electronAPI.pathSeparator() fuera del hook, si es necesario
// export const getPathSeparator = async () => {
//   if (window.electronAPI && typeof window.electronAPI.getPathSeparator === 'function') {
//     return await window.electronAPI.getPathSeparator();
//   }
//   return navigator.platform.indexOf('Win') > -1 ? '\\' : '/'; // Fallback
// };


export default useFileStore;