import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaSearch, FaCog, FaHome } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import useFileStore from '@/store/fileStore';
import type { FileSystemItem } from '@/store/fileStore'; // Import type for clarity

interface CollapsibleSectionProps {
  title: string;
  items: { id: string; name: string }[]; // id is now path
  onAddItem: () => void;
  onItemClick: (path: string, type: 'notebook' | 'page') => void;
  activeItemId?: string | null; // path of the active item
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, items, onAddItem, onItemClick, activeItemId }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-400">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-1 hover:text-white">
          {isOpen ? <FaChevronDown size="0.8em"/> : <FaChevronRight size="0.8em"/>}
          <span>{title}</span>
        </button>
        <button onClick={onAddItem} className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white" title={`Crear ${title === 'Notbooks' ? 'notbook nuevo' : 'página nueva'}`}>
          <FaPlus size="0.9em"/>
        </button>
      </div>
      {isOpen && (
        <ul className="pl-4 pr-1 space-y-0.5">
          {items.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id, title === 'Notbooks' ? 'notebook' : 'page')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm truncate
                  ${activeItemId === item.id
                    ? 'bg-gray-600 text-white' // Active item
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                title={item.name}
              >
                {item.name}
              </button>
            </li>
          ))}
           {items.length === 0 && <p className="px-3 py-1.5 text-xs text-gray-500 italic">No hay {title.toLowerCase()}.</p>}
        </ul>
      )}
    </div>
  );
};


const FileOutlineSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'archivo' | 'esquema'>('archivo');

  // Selectors from useFileStore
  const projectRootPath = useFileStore(state => state.projectRootPath);
  const notebooks = useFileStore(state => state.getNotebooks().map(nb => ({ id: nb.path, name: nb.name })));
  const activeNotebookPath = useFileStore(state => state.activeNotebookPath);
  const currentFilePath = useFileStore(state => state.currentFilePath);
  
  const pagesForNotebook = useFileStore(state => 
    state.activeNotebookPath 
      ? state.getPagesForNotebook(state.activeNotebookPath).map(p => ({ id: p.path, name: p.name }))
      : []
  );
  const loosePages = useFileStore(state => state.getLoosePages().map(p => ({ id: p.path, name: p.name })));

  const setActiveNotebookPath = useFileStore(state => state.setActiveNotebookPath);
  const openFile = useFileStore(state => state.openFile);
  const createNewFile = useFileStore(state => state.createNewFile);
  const createNewNotebook = useFileStore(state => state.createNewNotebook); // Added createNewNotebook

  // Determine which pages to display
  const displayedPages = activeNotebookPath ? pagesForNotebook : loosePages;

  // Clean current file name for display
  const currentFileNameForDisplay = currentFilePath
    ? currentFilePath.substring(currentFilePath.lastIndexOf(currentFilePath.includes('/') ? '/' : '\\') + 1).replace(/\.[^/.]+$/, "") 
    : "Sin título";

  const handleItemClick = (path: string, type: 'notebook' | 'page') => {
    if (type === 'notebook') {
      // If the same notebook is clicked, deselect it to show loose pages
      if (activeNotebookPath === path) {
        setActiveNotebookPath(null);
      } else {
        setActiveNotebookPath(path);
      }
    } else { // type === 'page'
      openFile(path);
    }
  };
  
  const handleAddNewNotebook = async () => { // Modified to be async and use createNewNotebook
    if (!projectRootPath) {
      console.error("Cannot create notebook: Project root path is not set.");
      // TODO: Optionally, show a user-facing error message here
      return;
    }

    try {
      const result = await createNewNotebook(projectRootPath);
      if (result.path) {
        console.log(`Notebook "${result.name}" created at ${result.path}`);
        // Optional: Add any UI feedback, like a notification
      } else {
        console.log("Notebook creation was cancelled or failed (e.g., empty name, user cancellation, or sanitization failure).");
        // Optional: User feedback if name was invalid or creation failed silently
      }
    } catch (error) {
      console.error("Error creating notebook:", error);
      // Optional: Show a user-facing error message
    }
  };

  const handleAddNewPage = async () => {
    // If a notebook is active, create the page inside it.
    // Otherwise, create a loose page (projectRootPath will be used by createNewFile).
    await createNewFile(activeNotebookPath); 
    // After creation, the new file (with a temp ID) should be set as currentFilePath,
    // and openFile should be implicitly called or routing handled.
    // The store's createNewFile sets currentFilePath to a temp ID and isDirty=true.
  };


  return (
    <aside className="w-72 min-w-[240px] bg-[#252526] text-gray-300 flex flex-col border-r border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-md font-medium text-white truncate flex-grow" title={currentFileNameForDisplay}>
          {currentFileNameForDisplay || "Sin título"}
        </h3>
        <NavLink
          to={projectRootPath ? "/all-notes" : "/"}
          title="Ir a Todas las Notas"
          className="p-1.5 rounded hover:bg-gray-600 text-gray-400 hover:text-white ml-2 flex-shrink-0"
        >
          <FaHome size="1.1em"/>
        </NavLink>
      </div>

      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={() => setActiveTab('archivo')}
            className={`px-4 py-1.5 rounded text-sm font-medium
              ${activeTab === 'archivo' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            Archivo
          </button>
          <button
            onClick={() => setActiveTab('esquema')}
            className={`px-4 py-1.5 rounded text-sm font-medium
              ${activeTab === 'esquema' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            Esquema
          </button>
          <div className="flex-grow" />
          <button className="p-2 rounded hover:bg-gray-600 text-gray-400 hover:text-white" title="Buscar (funcionalidad pendiente)">
            <FaSearch size="1em"/>
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-1">
        {activeTab === 'archivo' && (
          <>
            <CollapsibleSection
              title="Notbooks"
              items={notebooks}
              onAddItem={handleAddNewNotebook}
              onItemClick={handleItemClick}
              activeItemId={activeNotebookPath}
            />
            <CollapsibleSection
              title="Páginas"
              items={displayedPages}
              onAddItem={handleAddNewPage}
              onItemClick={handleItemClick}
              activeItemId={currentFilePath} // A page is active if it's the currentFilePath
            />
          </>
        )}
        {activeTab === 'esquema' && (
          <div className="p-4 text-center text-gray-500 italic">
            El esquema del documento aparecerá aquí.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-700">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium
            ${isActive ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`
          }
        >
          <FaCog className="text-gray-500" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default FileOutlineSidebar;