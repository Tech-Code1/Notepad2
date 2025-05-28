import useFileStore from '@/store/fileStore';
import React from 'react';

const StatusBar: React.FC = () => {
  const { currentFilePath, currentFileContent, isLoading, error, isDirty } = useFileStore();
  const lineCount = currentFileContent ? currentFileContent.split('\n').length : 0;
  const charCount = currentFileContent ? currentFileContent.length : 0;

  let statusMessage = "Listo";
  if (isLoading) statusMessage = "Cargando...";
  else if (error) statusMessage = `Error: ${error.substring(0, 50)}...`;
  else if (currentFilePath) statusMessage = `${isDirty ? '(Modificado) ' : ''}${currentFilePath.split(/[\\/]/).pop()}`;
  else if (isDirty) statusMessage = "Nuevo (Modificado)";
  else statusMessage = "Nuevo documento";

  return (
    <footer className="flex justify-between items-center py-1 px-4 bg-accent-primary text-white text-xs flex-shrink-0 min-h-[22px] border-t border-border-color">
      <div className="truncate" title={currentFilePath || "Nuevo documento"}>{statusMessage}</div>
      <div className="flex items-center space-x-3">
        <span>Líneas: {lineCount}</span>
        <span>Chars: {charCount}</span>
      </div>
    </footer>
  );
};

export default StatusBar;