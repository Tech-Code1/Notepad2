import { app } from 'electron';

import { updateElectronApp } from 'update-electron-app';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

updateElectronApp();

app.on('ready', () => {
  //const dashboard = getOrCreateDefaultDashboard();
});

app.on('window-all-closed', () => app.quit());
app.on('quit', () => console.warn('App quit'));