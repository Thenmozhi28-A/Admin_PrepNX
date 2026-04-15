import { useState } from 'react';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout: FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F9FAFB', }}>
      {/* Sidebar */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,

        }}
      >
        <Header onMenuClick={handleDrawerToggle} />

        <Box sx={{ flexGrow: 1 }}>
          {/* Dynamic Page Content */}
          <Box sx={{
            p: 0, backgroundColor: '#f5f7fa'
          }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
