import React, { useState } from 'react';
import useFileStore from '@/store/fileStore';
import {
  FaRegFileAlt, // For All Notes
  FaRegStar,    // For Favorites
  FaUsers,      // For Shared
  FaHashtag,    // For Tags
  FaRegTrashAlt, // For Trash
  FaCog,        // For Settings
} from 'react-icons/fa';


// const { theme, toggleTheme } = useThemeStore();

// <button onClick={toggleTheme} title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`} className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary">
//             {theme === 'dark' ? <FaSun size="1.1em" /> : <FaMoon size="1.1em" />}
// </button>

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action?: () => void; // Optional action
}

const Sidebar: React.FC = () => {
  const { createNewFile } = useFileStore();
  // State to manage the active navigation item
  const [activeItem, setActiveItem] = useState<string>('all-notes');

  // Define the main navigation items based on the image
  const mainNavItems: NavItem[] = [
    { id: 'all-notes', label: 'All Notes', icon: FaRegFileAlt, action: () => console.log('All Notes clicked') },
    { id: 'favorites', label: 'Favorites', icon: FaRegStar, action: () => console.log('Favorites clicked') },
  ];

  const handleNavItemClick = (item: NavItem) => {
    setActiveItem(item.id);
    if (item.action) {
      item.action();
    }
  };

  const handleNewNoteClick = () => {
    // You might want to deselect any active item or set "All Notes" as active
    // setActiveItem('all-notes'); // Or some other logic
    createNewFile();
  };

  const handleSettingsClick = () => {
    setActiveItem('settings'); // Make settings active if clicked
    console.log('Settings clicked');
    // Potentially open a settings modal or navigate to a settings page
  };

  return (
    <aside className="w-64 min-w-[200px] bg-[#1E1E1E] text-gray-300 flex flex-col p-4 space-y-4">
      {/* Top "Notes" Title */}
      <div className="px-2 py-1">
        <h2 className="text-2xl font-semibold text-white">Notes</h2>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-grow">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavItemClick(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    ${isActive
                      ? 'bg-gray-700 text-white' // Active state from image
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2 pt-4 border-t border-gray-700">
        {/* New Note Button */}
        <button
          onClick={handleNewNoteClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-150"
        >
          New Note
        </button>

        {/* Settings Link/Button */}
        <button
          onClick={handleSettingsClick}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
            ${activeItem === 'settings'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
          <FaCog className={`h-5 w-5 ${activeItem === 'settings' ? 'text-white' : 'text-gray-500'}`} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;