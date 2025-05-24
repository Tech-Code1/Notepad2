// src/store/fileStore.ts
import { create } from 'zustand';

export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  // children?: FileSystemItem[]; // Para una estructura de árbol más compleja
}

interface FileStoreState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  fileSystemTree: FileSystemItem[];
  currentDirectoryPath: string | null;
  projectRootPath: string | null;

  currentFilePath: string | null;
  currentFileContent: string;
  originalFileContent: string;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  setFileSystemTree: (tree: FileSystemItem[]) => void;
  setCurrentDirectoryPath: (path: string | null) => void;
  setProjectRootPath: (path: string | null) => void;
  openFile: (filePath?: string) => Promise<void>;
  updateCurrentFileContent: (content: string) => void;
  saveCurrentFile: () => Promise<void>;
  saveFileAs: () => Promise<void>;
  fetchFileSystemTree: (basePath?: string | null) => Promise<void>;
  createNewFile: () => void;
}

const useFileStore = create<FileStoreState>((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  fileSystemTree: [],
  currentDirectoryPath: null,
  projectRootPath: null,

  currentFilePath: null,
  currentFileContent: '',
  originalFileContent: '',
  isDirty: false,
  isLoading: false,
  error: null,

  setFileSystemTree: (tree) => set({ fileSystemTree: tree }),
  setCurrentDirectoryPath: (path) => set({ currentDirectoryPath: path }),
  setProjectRootPath: (path) => set({ projectRootPath: path }),

  openFile: async (filePath?: string) => {
    let pathToFile = filePath;
    if (!pathToFile) {
      const selectedPath = await window.electronAPI.openFile();
      if (!selectedPath) return;
      pathToFile = selectedPath;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await window.electronAPI.readFile(pathToFile);
      if (result.content !== undefined && result.path) {
        set({
          currentFilePath: result.path,
          currentFileContent: result.content,
          originalFileContent: result.content,
          isDirty: false,
          isLoading: false,
        });
      } else {
        throw new Error(result.error || 'No se pudo leer el archivo.');
      }
    } catch (err: any) {
      console.error('Error opening file:', err);
      set({ error: `Error al abrir ${pathToFile}: ${err.message}`, isLoading: false });
    }
  },

  updateCurrentFileContent: (content) => {
    set((state) => ({
      currentFileContent: content,
      isDirty: content !== state.originalFileContent,
    }));
  },

  saveCurrentFile: async () => {
    const { currentFilePath, currentFileContent } = get();
    // if (!currentFileContent && !currentFilePath) { // Pequeña corrección lógica
    //   console.log("Nada que guardar o archivo no especificado para nuevo guardado.");
    //   // return; // Podrías retornar o llamar a saveFileAs
    // }

    set({ isLoading: true });
    try {
      const result = await window.electronAPI.saveFile(currentFilePath, currentFileContent);
      if (result.success && result.path) {
        set({
          currentFilePath: result.path,
          originalFileContent: currentFileContent,
          isDirty: false,
          isLoading: false,
          error: null,
        });
        // Considerar recargar el árbol si el nombre/path cambió
        // if (get().projectRootPath) get().fetchFileSystemTree(get().projectRootPath);
      } else {
        throw new Error(result.error || 'Error al guardar el archivo.');
      }
    } catch (err: any) {
      console.error('Error saving file:', err);
      set({ error: `Error al guardar: ${err.message}`, isLoading: false });
    }
  },

  saveFileAs: async () => {
    const { currentFileContent } = get();
    set({ isLoading: true });
    try {
      const result = await window.electronAPI.saveFile(null, currentFileContent); // null para forzar diálogo
      if (result.success && result.path) {
        set({
          currentFilePath: result.path,
          originalFileContent: currentFileContent,
          isDirty: false,
          isLoading: false,
          error: null,
        });
        // if (get().projectRootPath) get().fetchFileSystemTree(get().projectRootPath);
      } else {
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

      if (pathToList === null) { // Pedir explícitamente si es null, no undefined
        const result = await window.electronAPI.readDirectory(null);
        if (result.success && result.path && result.items) {
          pathToList = result.path;
          set({ projectRootPath: pathToList, currentDirectoryPath: pathToList, fileSystemTree: result.items, isLoading: false });
          return;
        } else {
          set({ isLoading: false, error: result.error || "No se seleccionó una carpeta de proyecto.", fileSystemTree: [] });
          return;
        }
      }
      
      const result = await window.electronAPI.readDirectory(pathToList);
      if (result.success && result.items && result.path) {
        set({
          fileSystemTree: result.items,
          currentDirectoryPath: result.path, // Actualiza el directorio actual
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

  createNewFile: () => {
    set({
      currentFilePath: null,
      currentFileContent: `# Nuevo Documento\n\n¡Comienza a escribir tus ideas aquí!`,
      originalFileContent: '', // Un archivo nuevo no tiene contenido original guardado
      isDirty: true, 
      error: null,
    });
  },
}));

export default useFileStore;