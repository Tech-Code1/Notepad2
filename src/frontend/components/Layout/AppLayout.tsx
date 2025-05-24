import { Outlet, useLocation } from 'react-router-dom';
import { FC } from 'react';
import useFileStore from '@/store/fileStore';
import FileOutlineSidebar from '../Sidebar/FileOutlineSidebar';
import Sidebar from '../Sidebar/Sidebar';

const AppLayout: FC = () => {
  const { currentFilePath } = useFileStore();
  const location = useLocation();

  const showFileOutlineSidebar = currentFilePath || location.pathname.startsWith('/note/');

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      {showFileOutlineSidebar ? <FileOutlineSidebar /> : <Sidebar />}
      <main className="flex-1 overflow-y-auto p-6"> {/* o el padding que necesites */}
        <Outlet /> {/* Aquí se renderizarán AllNotesView, NoteEditorView, etc. */}
      </main>
    </div>
  );
};

export default AppLayout;