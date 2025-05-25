// src/components/Sidebar/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useFileStore from '@/store/fileStore';
import {
  FaRegFileAlt,
  FaRegStar,
  FaUsers,
  FaHashtag,
  FaRegTrashAlt,
  FaCog,
} from 'react-icons/fa';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean; // Para NavLink active state
}

const Sidebar: React.FC = () => {
  const { createNewFile } = useFileStore();
  const navigate = useNavigate();

  const mainNavItems: NavItem[] = [
    { to: '/all-notes', label: 'All Notes', icon: FaRegFileAlt, exact: true },
    //{ to: '/favorites', label: 'Favorites', icon: FaRegStar }, // Placeholder
    //{ to: '/shared', label: 'Shared', icon: FaUsers },         // Placeholder
    //{ to: '/tags', label: 'Tags', icon: FaHashtag },           // Placeholder
    //{ to: '/trash', label: 'Trash', icon: FaRegTrashAlt },     // Placeholder
  ];

  const handleNewNoteClick = async () => {
    const newFile = await createNewFile(); // Asumimos que createNewFile ahora setea currentFilePath y quizás devuelve el path o id
    if (newFile && newFile.path) {
      // Extraer un ID o usar el path como ID. Para simplicidad, usaré el nombre base como ID.
      const noteId = newFile.name.replace(/\.[^/.]+$/, ""); // Elimina extensión
      navigate(`/note/${encodeURIComponent(noteId)}`); // Navega al editor de la nueva nota
    } else {
      // Manejar caso donde la nota no se creó o no se obtuvo path
      console.error("No se pudo crear la nueva nota o obtener su path.");
      // Quizás navegar a /all-notes como fallback
      navigate('/all-notes');
    }
  };

  const activeClassName = "bg-gray-700 text-white"; // Tu clase para el item activo
  const inactiveClassName = "text-gray-400 hover:bg-gray-700 hover:text-white";

  return (
    <aside className="w-64 min-w-[200px] bg-[#1E1E1E] text-gray-300 flex flex-col p-4 space-y-4">
      <div className="px-2 py-1">
        <h2 className="text-2xl font-semibold text-white">Notes</h2>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact} // `end` prop para NavLink para que coincida exactamente en `/` o `/all-notes`
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    ${isActive ? activeClassName : inactiveClassName}`
                  }
                >
                  <Icon className={`h-5 w-5 ${
                      ({isActive}: {isActive:boolean}) => isActive ? 'text-white' : 'text-gray-500' // Esto puede necesitar un ajuste para NavLink
                    }`} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleNewNoteClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-150"
        >
          New Note
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
            ${isActive ? activeClassName : inactiveClassName}`
          }
        >
          <FaCog className={`h-5 w-5 ${ ({isActive}: {isActive:boolean}) => isActive ? 'text-white' : 'text-gray-500'}`} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;