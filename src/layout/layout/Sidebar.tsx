import type { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { SidebarProps } from '../../types/Types';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button as MuiButton,
  styled,
  useTheme,
  useMediaQuery,
  Dialog,
} from '@mui/material';
import {
  Building2,
  Users2,
  ShieldCheck,
  CreditCard,
  Mail,
  ClipboardList,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGetOrganizationQuery } from '../../store/api/organizationApi';
import { toast } from 'react-toastify';

const DRAWER_WIDTH = 288; // 72 * 4 (w-72 in Tailwind)

const StyledDrawer = styled(Drawer)(() => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#0f1b2d',
    color: '#fff',
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    /* Hide scrollbar */
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
}));

const NavItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean; component?: any; to?: string }>(({ active }) => ({
  margin: '0 16px',
  borderRadius: '12px',
  padding: '12px 16px',
  transition: 'all 0.2s',
  color: active ? '#fff' : '#9CA3AF',
  backgroundColor: active ? '#2463EB' : 'transparent',
  background: active ? 'linear-gradient(90deg, #2463EB 0%, #1E40AF 100%)' : 'transparent',
  '&:hover': {
    backgroundColor: active ? '#2463EB' : 'rgba(255, 255, 255, 0.05)',
    background: active ? 'linear-gradient(90deg, #2463EB 0%, #1E40AF 100%)' : 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    '& .MuiListItemIcon-root': {
      color: '#fff',
      transform: 'scale(1.1)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: active ? '#fff' : '#9CA3AF',
    minWidth: 'auto',
    marginRight: '12px',
    transition: 'all 0.2s',
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));



const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { logout, authStorage } = useAuth();
  const organisationId = authStorage?.data?.organisation?.id || '';

  const { data: orgResponse } = useGetOrganizationQuery(organisationId, {
    skip: !organisationId,
    refetchOnMountOrArgChange: true,
  });
  const orgData = orgResponse?.data;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const navItems = [
    { name: 'Organization', path: '/admin/organization', icon: Building2 },
    { name: 'Users', path: '/admin/users', icon: Users2 },
    { name: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck },
    { name: 'Billing & Plans', path: '/admin/billing', icon: CreditCard },
    { name: 'Email Templates', path: '/admin/email-templates', icon: Mail },
    { name: 'Audit Log', path: '/admin/audit-log', icon: ClipboardList },
  ];

  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      anchor="left"
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: '24px 24px 32px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', mb: '8px' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              backgroundColor: '#2463EB',
              background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {orgData?.logoUrl ? (
              <Box component="img" src={orgData.logoUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (orgData?.name?.charAt(0) || 'O')
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                fontSize: '1.15rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {orgData?.name || 'Organization'}
            </Typography>
            {/* <Typography
              variant="caption"
              sx={{
                fontSize: '9px',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                opacity: 0.8
              }}
            >
              Control Panel
            </Typography> */}
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 0, gap: '10px', display: 'flex', flexDirection: 'column' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <NavItemButton
                component={NavLink}
                to={item.path}
                active={isActive}
                onClick={onClose}
              >
                <ListItemIcon>
                  <item.icon size={20} />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </NavItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <MuiButton
          fullWidth
          startIcon={<LogOut size={20} />}
          onClick={() => setIsLogoutDialogOpen(true)}
          sx={{
            justifyContent: 'flex-start',
            px: 2,
            py: 2,
            color: '#EF4444',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.025em',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              '& .MuiButton-startIcon': {
                transform: 'translateX(-4px)',
              },
            },
            '& .MuiButton-startIcon': {
              transition: 'transform 0.2s',
              marginRight: '12px',
            },
          }}
        >
          Logout
        </MuiButton>
      </Box>
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px', p: 1, width: '400px' }
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#FEF2F2', color: '#EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2
          }}>
            <AlertCircle size={28} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1E293B' }}>
            Confirm Logout
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Are you sure you want to log out? You will need to sign in again to access your workspace.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <MuiButton
              fullWidth
              onClick={() => setIsLogoutDialogOpen(false)}
              sx={{
                py: 1.5, borderRadius: '12px', color: '#64748B',
                fontWeight: 700, textTransform: 'none', backgroundColor: '#F1F5F9',
                '&:hover': { backgroundColor: '#E2E8F0' }
              }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              fullWidth
              variant="contained"
              onClick={handleLogout}
              sx={{
                py: 1.5, borderRadius: '12px', backgroundColor: '#EF4444',
                fontWeight: 700, textTransform: 'none',
                '&:hover': { backgroundColor: '#DC2626' }
              }}
            >
              Logout
            </MuiButton>
          </Box>
        </Box>
      </Dialog>
    </StyledDrawer>
  );
};

export default Sidebar;
