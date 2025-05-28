import { app, BrowserWindow } from 'electron'; // <--- NECESITAS IMPORTAR BrowserWindow
import path from 'path'; // <--- NECESITAS PATH PARA EL PRELOAD
import { updateElectronApp } from 'update-electron-app';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

updateElectronApp();

// Esta función es la que crea la ventana
const createWindow = () => {
  // Crea la ventana del navegador.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // IMPORTANTE: __dirname apunta al directorio del archivo actual.
      // MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY es una variable que Electron Forge/Vite define
      // y apunta al script de preload compilado.
      preload: path.join(__dirname, 'preload.js'), // <--- Ajusta esto a la ruta de tu preload compilado
      // Si usas el template de Electron Forge con Vite, podría ser algo como:
      // preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY, (si está definido globalmente por el plugin)
      // O necesitas saber dónde Vite pone el preload.js compilado.
      // En tu log se ve: .vite/build/preload.js
      // Así que podría ser relativo desde .vite/build/main.js a .vite/build/preload.js
      // O mejor, confiar en las variables que provee el plugin de Vite de Electron Forge si las hay.
      // Vamos a asumir que el preload.js está en la misma carpeta que main.js después del build.
      // Si el `main.js` está en `.vite/build/main.js` y `preload.js` en `.vite/build/preload.js`
      // entonces `path.join(__dirname, 'preload.js')` debería funcionar si `__dirname` es `.vite/build/`
      // Lo más seguro es ver la documentación de @electron-forge/plugin-vite para las variables de entrada
      // o construir la ruta correctamente.

      // Por ahora, intentemos la ruta directa relativa al output de main.js:
      // preload: path.join(__dirname, 'preload.js'), // Si main.js y preload.js están juntos en .vite/build/
      // Si tu main.js está en `src/main.ts` y preload en `src/preload.ts`
      // y la salida de Vite es `.vite/build/main.js` y `.vite/build/preload.js`
      // la ruta relativa desde main.js a preload.js es simplemente 'preload.js'
      // preload: path.join(__dirname, 'preload.js') // Esto es común.
      // Asegúrate que `preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY` no esté disponible.
      // Si usas el template por defecto de Electron Forge + Vite, estas variables mágicas suelen estar:
      // preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY
    },
  });

  // y carga el index.html de la aplicación.
  // MAIN_WINDOW_VITE_DEV_SERVER_URL es para desarrollo (servidor de Vite)
  // MAIN_WINDOW_VITE_NAME es para producción (archivo index.html)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    // La ruta anterior es típica. Tendrás que ajustarla si tu `MAIN_WINDOW_VITE_NAME`
    // o la estructura de salida es diferente.
    // Por ejemplo, si tu `index.html` está en `dist/renderer/index.html` y tu main.js en `dist/main.js`
    // sería `path.join(__dirname, '../renderer/index.html')`
    // Si `MAIN_WINDOW_VITE_NAME` contiene `main_window` (el nombre de tu renderer)
    // y los archivos del renderer se ponen en `out/renderer/main_window/index.html`,
    // y tu `main.js` está en `out/main/main.js`,
    // la ruta sería `path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)`
  }

  // Abre las DevTools (opcional, para depuración).
  // if (!app.isPackaged) { // Solo en desarrollo
  //   mainWindow.webContents.openDevTools();
  // }
};


// Este método se llamará cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
// Algunas APIs solo pueden usarse después de que ocurra este evento.
app.on('ready', () => {
  createWindow(); // <--- ¡NECESITAS LLAMAR A LA FUNCIÓN QUE CREA LA VENTANA!

  app.on('activate', () => {
    // En macOS es común recrear una ventana en la aplicación cuando el
    // icono del dock es clickeado y no hay otras ventanas abiertas.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // En macOS es común para las aplicaciones y sus barras de menú
  // que permanezcan activas hasta que el usuario salga explícitamente con Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app.on('quit', () => console.warn('App quit')); // Ya no es necesario si tienes el window-all-closed