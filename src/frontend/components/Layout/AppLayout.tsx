import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FC, useEffect } from 'react';
import useFileStore from '@/store/fileStore';
import FileOutlineSidebar from '../Sidebar/FileOutlineSidebar';
import Sidebar from '../Sidebar/Sidebar';

const AppLayout: FC = () => {
  const { currentFilePath } = useFileStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentFilePath && !currentFilePath.startsWith('unsaved-')) {
      const noteId = encodeURIComponent(currentFilePath);
      const targetPath = `/note/${noteId}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }
    }
    // Optional: handle navigating away if currentFilePath is null
    // else if (currentFilePath === null && location.pathname.startsWith('/note/')) {
    //   if (location.pathname !== '/all-notes') { // Avoid navigating if already there
    //     navigate('/all-notes');
    //   }
    // }
  }, [currentFilePath, navigate, location]);

  const showFileOutlineSidebar = currentFilePath !== null || location.pathname === '/note/new' || location.pathname.startsWith('/note/');

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