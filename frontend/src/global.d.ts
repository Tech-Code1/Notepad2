import { IChildRenderer } from "./child-process/preload";
import { IRenderer } from "./preload";

export interface IElectronAPI {
  // Define aquí los métodos que tu preload script expone en window.electronAPI
  // Las firmas deben coincidir con lo que expusiste en el preload.
  openFile: () => Promise<string | null>;
  readFile: (filePath: string) => Promise<{ success: boolean; path?: string; content?: string; error?: string }>;
  saveFile: (filePath: string | null, content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  readDirectory: (basePath: string | null) => Promise<{ success: boolean; path?: string; items?: FileSystemItem[]; error?: string }>;
  createNewFileInSystem?: (filePath: string) => Promise<{ success: boolean; path?: string; error?: string }>; // Si tienes esta función
  deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  saveImage: (projectRootPath: string, fileData: { buffer: ArrayBuffer; name: string; type: string; }) => Promise<{ success: boolean; url?: string; error?: string }>;
  pathSeparator: () => Promise<string>; // Si pathSeparator es una función que devuelve una promesa
  // O si es síncrono y se establece una vez:
  // getPathSeparator: () => string;
  // Y en el preload: contextBridge.exposeInMainWorld('electronAPI', { getPathSeparator: () => require('path').sep })

  // Añade cualquier otra función que expongas
} 

declare global {
    interface Window {
        electron: IRenderer & IChildRenderer
        electronAPI: IElectronAPI;
    }
}