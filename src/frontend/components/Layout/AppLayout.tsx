import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Keep useNavigate if used by useEffect
import { FC, useEffect } from 'react'; // Keep useEffect if used
import useFileStore from '@/store/fileStore';
import FileOutlineSidebar from '../Sidebar/FileOutlineSidebar';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header'; // Import the new Header

const AppLayout: FC = () => {
  const { currentFilePath } = useFileStore();
  const location = useLocation();
  // const navigate = useNavigate(); // Keep if the useEffect for navigation is present

  // Keep the useEffect for navigation if it was added in a previous step
  // (Assuming it was, based on prior subtask completions)
  /*
  useEffect(() => {
    if (currentFilePath && !currentFilePath.startsWith('unsaved-')) {
      const noteId = encodeURIComponent(currentFilePath);
      const targetPath = `/note/${noteId}`;
      if (location.pathname !== targetPath) {
        // navigate(targetPath); // Keep if navigate is defined
      }
    }
  }, [currentFilePath, location]); // Removed navigate from deps if not used
  */

  // Updated logic for showFileOutlineSidebar based on previous work
  const showFileOutlineSidebar = currentFilePath !== null || location.pathname.startsWith('/note/');

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
      <Header /> {/* Header at the top, full width */}
      
      <div className="flex flex-1 overflow-hidden"> {/* Container for Sidebar + Main Content */}
        {/* Sidebar */}
        {showFileOutlineSidebar ? <FileOutlineSidebar /> : <Sidebar />}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6"> {/* Ensure this area scrolls, not the whole page below header */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;