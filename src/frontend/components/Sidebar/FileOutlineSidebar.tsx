import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaSearch, FaCog } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import useFileStore from '@/store/fileStore'; // Para obtener el título del archivo actual, etc.

// Placeholder data - Deberías obtener esto de tu estado global (ej. fileStore)
const notebooksData = [
  { id: 'nb1', name: 'Notebook 1', pages: [{id: 'p1-1', name: 'Página 1.1'}, {id: 'p1-2', name: 'Página 1.2'}] },
  { id: 'nb2', name: 'Notebook 2', pages: [{id: 'p2-1', name: 'Página 2.1'}] },
];

const pagesData = [
  { id: 'pg1', name: 'Página 1' },
  { id: 'pg2', name: 'Página 2' },
];

interface CollapsibleSectionProps {
  title: string;
  items: { id: string; name: string }[];
  onAddItem: () => void;
  onItemClick: (id: string, type: 'notebook' | 'page') => void;
  activeItemId?: string | null;
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
        <button onClick={onAddItem} className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white">
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
  const { currentFilePath, currentFileContent } = useFileStore(); // Asumiendo que tienes algo así para el título
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'archivo' | 'esquema'>('archivo');
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  // Determinar el título del archivo actual
  // Esto es una simplificación, necesitarías una lógica más robusta
  const currentFileName = currentFilePath ? currentFilePath.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, "") : "Sin título";


  const handleItemClick = (id: string, type: 'notebook' | 'page') => {
    if (type === 'notebook') {
      setActiveNotebookId(id);
      setActivePageId(null); // Deseleccionar página si se selecciona un notebook
      // Aquí podrías navegar o cargar el contenido del notebook
      console.log(`Notebook ${id} clicked`);
    } else {
      setActivePageId(id);
      setActiveNotebookId(null); // Deseleccionar notebook si se selecciona una página
      // Navegar a la página/nota
      navigate(`/note/${encodeURIComponent(id)}`); // Asumiendo que 'id' es el noteId
    }
  };

  return (
    <aside className="w-72 min-w-[240px] bg-[#252526] text-gray-300 flex flex-col border-r border-gray-700">
      {/* Título del archivo actual */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-md font-medium text-white truncate" title={currentFileName}>
          {currentFileName || "Sin título"}
        </h3>
      </div>

      {/* Tabs Archivo/Esquema y Búsqueda */}
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
          <div className="flex-grow" /> {/* Spacer */}
          <button className="p-2 rounded hover:bg-gray-600 text-gray-400 hover:text-white">
            <FaSearch size="1em"/>
          </button>
        </div>
        {/* Aquí iría la barra de búsqueda si la quieres bajo los tabs */}
        {/* <input type="text" placeholder="Buscar en archivo..." className="w-full bg-gray-800 border border-gray-700 rounded py-1 px-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" /> */}
      </div>

      {/* Contenido de Tabs */}
      <div className="flex-grow overflow-y-auto p-1">
        {activeTab === 'archivo' && (
          <>
            <CollapsibleSection
              title="Notbooks"
              items={notebooksData} // Reemplazar con datos reales de tu store
              onAddItem={() => console.log('Add Notebook')}
              onItemClick={(id) => handleItemClick(id, 'notebook')}
              activeItemId={activeNotebookId}
            />
            <CollapsibleSection
              title="Páginas"
              items={pagesData} // Reemplazar con datos reales de tu store
              onAddItem={() => console.log('Add Page')}
              onItemClick={(id) => handleItemClick(id, 'page')}
              activeItemId={activePageId}
            />
            {/* Otros elementos de la pestaña "Archivo" */}
          </>
        )}
        {activeTab === 'esquema' && (
          <div className="p-4 text-center text-gray-500 italic">
            El esquema del documento aparecerá aquí.
          </div>
        )}
      </div>

      {/* Settings en la parte inferior */}
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