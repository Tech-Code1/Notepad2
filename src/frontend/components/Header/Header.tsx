// src/frontend/components/Header/Header.tsx
import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Header: React.FC = () => {
  const handleNotificationsClick = () => {
    console.log("Notificaciones clickeadas");
    // Placeholder for future dropdown/modal:
    // alert("No hay notificaciones nuevas."); 
  };

  const handleAvatarClick = () => {
    console.log("Avatar clickeado");
    // Placeholder for future dropdown/modal:
    // alert("Perfil (Próximamente)\nCerrar Sesión (Próximamente)");
  };

  return (
    <header 
      className="h-16 bg-neutral-800 text-gray-200 flex items-center justify-between px-4 py-3 shadow-md"
      // Using <header> semantic element
    >
      {/* Placeholder for Left/Central Content */}
      <div>
        {/* Optional: App Title or leave empty for now */}
      </div>

      {/* Right-Side Action Icons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleNotificationsClick}
          className="p-2 rounded-full hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
          aria-label="Notifications"
        >
          <FaBell className="h-5 w-5" />
        </button>

        <button
          onClick={handleAvatarClick}
          className="p-1.5 rounded-full hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
          aria-label="User menu"
        >
          <FaUserCircle className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
