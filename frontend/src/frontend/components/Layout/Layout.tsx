import React from 'react';
import useFileStore from '@/store/fileStore';
import Sidebar from '../Sidebar/Sidebar';
import StatusBar from '../StatusBar/StatusBar';
import EditorPane from '../EditorPane/EditorPane';


const Layout: React.FC = () => {
  const sidebarOpen = useFileStore((state) => state.sidebarOpen);

  return (
    <div className="flex h-screen bg-bg-primary"> {/* Tailwind: flex, h-screen, bg-bg-primary */}
      {sidebarOpen && <Sidebar />}
      <main className="flex-grow flex flex-col overflow-hidden"> {/* Tailwind: flex-grow, flex, flex-col, overflow-hidden */}
        <EditorPane />
        <StatusBar />
      </main>
    </div>
  );
};

export default Layout;